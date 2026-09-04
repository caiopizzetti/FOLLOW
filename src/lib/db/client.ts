import { createClient, type Client } from "@libsql/client";
import path from "node:path";

/**
 * Conexão com o banco. Só pode ser importado por código de servidor
 * (Server Components, Server Actions, scripts).
 *
 * Usamos libSQL (fork do SQLite) através de @libsql/client, que fala o mesmo
 * dialeto do SQLite e atende os dois ambientes com o MESMO código:
 *
 *   local       -> file:./data/follow.db      (arquivo)
 *   produção    -> libsql://...turso.io       (Turso, via HTTP)
 *
 * ATENÇÃO — este módulo NÃO pode tocar o filesystem.
 *
 * Em runtime ele só abre a conexão e executa SQL. Criar tabelas é trabalho de
 * setup/migração (`npm run db:push`, `db:seed`, `db:reset`), que roda em
 * ambiente com o repositório em disco.
 *
 * Motivo: `schema.sql` é um arquivo-fonte e não entra no build do Next. Ler
 * ele em runtime só funciona se a plataforma copiar o arquivo por conta
 * própria — o que a Vercel fez para as rotas de página, mas não para o
 * caminho das Server Actions, quebrando a criação de lead com
 * `ENOENT ... /var/task/src/lib/db/schema.sql`. Ver docs/arquitetura.md,
 * Decisão 9.
 */

const LOCAL_FILE = process.env.FOLLOW_DB_PATH ?? path.join(process.cwd(), "data", "follow.db");

declare global {
  var __followDb: Client | undefined;
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
 * Cliente do banco. Sem I/O de arquivo, sem migração: só a conexão.
 */
export function getDb(): Client {
  if (!globalThis.__followDb) {
    globalThis.__followDb = createClient({
      url: resolveUrl(),
      authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
    });
  }
  return globalThis.__followDb;
}

/** As tabelas do produto. Usado só para diagnosticar erro de tabela ausente. */
const TABLES = ["leads", "history"];

/**
 * Traduz "no such table" numa mensagem acionável.
 *
 * Acontece quando o banco existe mas nunca recebeu o schema — ou seja, faltou
 * rodar a migração. A mensagem aparece nos logs da plataforma; a tela mostra o
 * erro genérico do Next, que censura detalhes em produção.
 */
export function explainDbError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (/no such table/i.test(message) && TABLES.some((t) => message.includes(t))) {
    return new Error(
      `O banco está acessível, mas as tabelas não existem (${message}). ` +
        "Rode a migração antes de usar a aplicação: `npm run db:push` apontando " +
        "para o banco, ou cole scripts/seed.sql no console SQL do Turso.",
      { cause: error },
    );
  }
  return error instanceof Error ? error : new Error(message);
}
