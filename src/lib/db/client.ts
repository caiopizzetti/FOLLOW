import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Conexao unica com o SQLite. Este modulo so pode ser importado por codigo
 * de servidor (Server Components, Server Actions, scripts).
 *
 * Usamos o modulo `node:sqlite`, embutido no Node 22+, para nao depender de
 * modulo nativo compilado (better-sqlite3) nem de engine baixada em runtime
 * (Prisma). Ver docs/arquitetura.md.
 */

const DB_FILE = process.env.FOLLOW_DB_PATH ?? path.join(process.cwd(), "data", "follow.db");
const SCHEMA_FILE = path.join(process.cwd(), "src", "lib", "db", "schema.sql");

declare global {
  // eslint-disable-next-line no-var
  var __followDb: DatabaseSync | undefined;
}

function createConnection(): DatabaseSync {
  mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const db = new DatabaseSync(DB_FILE);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(readFileSync(SCHEMA_FILE, "utf8"));
  return db;
}

/**
 * Em dev o Next recarrega os modulos a cada edicao; guardamos a conexao no
 * globalThis para nao abrir um handle novo em cada hot reload.
 */
export function getDb(): DatabaseSync {
  if (!globalThis.__followDb) {
    globalThis.__followDb = createConnection();
  }
  return globalThis.__followDb;
}

export const DB_PATH = DB_FILE;
