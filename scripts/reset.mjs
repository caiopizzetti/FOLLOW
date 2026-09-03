/**
 * Apaga o conteúdo do banco alvo e recria as tabelas.
 * Uso: npm run db:reset
 */
import { openClient, pushSchema, TARGET } from "./db.mjs";

const client = openClient();
await pushSchema(client);
await client.batch(["DELETE FROM history;", "DELETE FROM leads;"], "write");
client.close();

console.log(`Banco limpo: ${TARGET}`);
