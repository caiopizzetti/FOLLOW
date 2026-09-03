/**
 * Helper compartilhado pelos scripts de banco.
 *
 * Usa o MESMO cliente da aplicação (libSQL), então os scripts funcionam tanto
 * no arquivo local quanto no banco hospedado (Turso).
 *
 *   local  -> file:./data/follow.db
 *   remoto -> defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN
 */
import { createClient } from "@libsql/client";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOCAL_FILE = process.env.FOLLOW_DB_PATH ?? path.join(ROOT, "data", "follow.db");

const REMOTE_URL = process.env.TURSO_DATABASE_URL?.trim();

export const TARGET = REMOTE_URL ? "remoto (Turso)" : `local (${LOCAL_FILE})`;

export function openClient() {
  if (!REMOTE_URL) mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  return createClient({
    url: REMOTE_URL ?? `file:${LOCAL_FILE}`,
    authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
  });
}

export function schemaSql() {
  return readFileSync(path.join(ROOT, "src", "lib", "db", "schema.sql"), "utf8");
}

/** Cria as tabelas se ainda não existirem. */
export async function pushSchema(client) {
  await client.executeMultiple(schemaSql());
}
