/**
 * Aplica o schema no banco alvo (idempotente).
 * Use antes do primeiro deploy, apontando para o banco hospedado:
 *
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:push
 */
import { openClient, pushSchema, TARGET } from "./db.mjs";

const client = openClient();
await pushSchema(client);
client.close();

console.log(`Schema aplicado no banco ${TARGET}.`);
