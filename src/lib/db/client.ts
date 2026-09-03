import { createClient, type Client } from "@libsql/client";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Conexão com o banco. Só pode ser importado por código de servidor
 * (Server Components, Server Actions, scripts).
 *
 * Usamos libSQL (fork do SQLite) através de @libsql/client, que fala o mesmo
 * dialeto do SQLite e atende os dois ambientes com o MESMO código:
 *
 *   local       -> file:./data/follow.db      (arquivo, como antes)
 *   produção    -> libsql://...turso.io       (Turso, via HTTP)
 *
 * Por que não `node:sqlite` mais: em ambiente serverless (Vercel) o sistema
 * de arquivos do bundle é somente-leitura e /tmp é efêmero e por instância,
 * então toda escrita se perderia. Ver docs/arquitetura.md, Decisão 8.
 */

const LOCAL_FILE = process.env.FOLLOW_DB_PATH ?? path.join(process.cwd(), "data", "follow.db");

declare global {
  var __followDb: Client | undefined;
  var __followSchema: Promise<void> | undefined;
}

/**
 * URL do banco.
 *
 * O arquivo local é válido em qualquer máquina com disco gravável e
 * persistente — inclusive rodando `npm start`. O que NÃO funciona é serverless:
 * lá o bundle é somente-leitura e /tmp é efêmero e por instância, então as
 * escritas se perderiam silenciosamente. Por isso o guard olha para a
 * plataforma, não para NODE_ENV.
 */
function resolveUrl(): string {
  const remote = process.env.TURSO_DATABASE_URL?.trim();
  if (remote) return remote;

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless) {
    throw new Error(
      "TURSO_DATABASE_URL não está definida. Em ambiente serverless o banco " +
        "precisa ser hospedado (Turso): o arquivo local não persiste entre " +
        "requisições. Configure TURSO_DATABASE_URL e TURSO_AUTH_TOKEN.",
    );
  }

  return `file:${LOCAL_FILE}`;
}

/**
 * Descreve um problema de configuração do banco, ou null se estiver tudo certo.
 *
 * Existe porque o Next censura a mensagem de erros de Server Component em
 * builds de produção ("The specific message is omitted..."). Sem isto, quem
 * esquecesse as variáveis de ambiente no deploy veria um erro genérico sem
 * saber o que fazer. Não expõe segredo nenhum — só diz qual variável falta.
 */
export function describeConfigProblem(): string | null {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (!isServerless) return null;
  if (process.env.TURSO_DATABASE_URL?.trim()) return null;
  return "TURSO_DATABASE_URL não está configurada neste deploy.";
}

export function getDb(): Client {
  if (!globalThis.__followDb) {
    globalThis.__followDb = createClient({
      url: resolveUrl(),
      authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
    });
  }
  return globalThis.__followDb;
}

/**
 * Aplica o schema (idempotente) uma única vez por processo.
 * Em dev isso cria o banco na primeira requisição; em produção o schema já
 * foi aplicado por `npm run db:push`, então isto é só uma rede de segurança.
 */
export function ensureSchema(): Promise<void> {
  if (!globalThis.__followSchema) {
    const sql = readFileSync(
      path.join(process.cwd(), "src", "lib", "db", "schema.sql"),
      "utf8",
    );
    globalThis.__followSchema = getDb()
      .executeMultiple(sql)
      .then(() => undefined)
      .catch((error) => {
        // Não memoriza a falha: a próxima chamada tenta de novo.
        globalThis.__followSchema = undefined;
        throw error;
      });
  }
  return globalThis.__followSchema;
}

/** Conexão pronta para uso: schema garantido. */
export async function db(): Promise<Client> {
  await ensureSchema();
  return getDb();
}
