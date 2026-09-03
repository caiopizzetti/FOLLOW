/**
 * Helper compartilhado pelos scripts de banco.
 * Abre o SQLite e aplica src/lib/db/schema.sql (idempotente).
 */
import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const DB_PATH =
  process.env.FOLLOW_DB_PATH ?? path.join(ROOT, "data", "follow.db");

export function openDb() {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(readFileSync(path.join(ROOT, "src", "lib", "db", "schema.sql"), "utf8"));
  return db;
}
