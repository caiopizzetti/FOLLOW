/**
 * Apaga e recria o banco local do MVP.
 * Uso: npm run db:reset
 */
import { openDb, DB_PATH } from "./db.mjs";

const db = openDb();
db.exec("DELETE FROM history;");
db.exec("DELETE FROM leads;");
db.close();

console.log(`Banco limpo: ${DB_PATH}`);
