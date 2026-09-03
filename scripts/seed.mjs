/**
 * Popula o banco alvo com a base de demonstração.
 *
 * ATENÇÃO: todos os dados inseridos são FICTÍCIOS (ver scripts/seed-data.mjs).
 * Uso: npm run db:seed   (ou npm run setup para limpar + popular)
 */
import { randomUUID } from "node:crypto";

import { openClient, pushSchema, TARGET } from "./db.mjs";
import { DEMO_LEADS } from "./seed-data.mjs";

/** Converte "há N dias" em um ISO timestamp. */
function daysAgoToIso(days, hour = 10) {
  if (days === null || days === undefined) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const client = openClient();
await pushSchema(client);

const existing = await client.execute("SELECT COUNT(*) AS n FROM leads");
const count = Number(existing.rows[0].n);
if (count > 0) {
  console.error(
    `O banco já contém ${count} leads (${TARGET}).\n` +
      `Rode "npm run db:reset" antes, ou "npm run setup" para fazer os dois.`,
  );
  client.close();
  process.exit(1);
}

const statements = [];
for (const lead of DEMO_LEADS) {
  const id = randomUUID();
  statements.push({
    sql: `INSERT INTO leads
            (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      lead.name,
      lead.phone ?? null,
      lead.email ?? null,
      lead.company ?? null,
      lead.value,
      lead.status,
      lead.source ?? null,
      daysAgoToIso(lead.createdDaysAgo, 9),
      daysAgoToIso(lead.lastContactDaysAgo),
      daysAgoToIso(lead.nextFollowUpDaysAgo, 9),
      lead.notes ?? null,
    ],
  });

  for (const event of lead.history ?? []) {
    statements.push({
      sql: "INSERT INTO history (id, lead_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [randomUUID(), id, event.type, event.message, daysAgoToIso(event.daysAgo, 11)],
    });
  }
}

await client.batch(statements, "write");

const leads = await client.execute("SELECT COUNT(*) AS n FROM leads");
const history = await client.execute("SELECT COUNT(*) AS n FROM history");
client.close();

console.log(`Seed aplicado no banco ${TARGET}`);
console.log(`  ${Number(leads.rows[0].n)} leads fictícios`);
console.log(`  ${Number(history.rows[0].n)} eventos de histórico`);
console.log("Lembrete: todos os dados são fictícios, apenas para demonstração.");
