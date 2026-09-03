/**
 * Popula o banco local com a base de demonstração.
 *
 * ATENÇÃO: todos os dados inseridos são FICTÍCIOS (ver scripts/seed-data.mjs).
 * Uso: npm run db:seed   (ou npm run setup para limpar + popular)
 */
import { randomUUID } from "node:crypto";

import { openDb, DB_PATH } from "./db.mjs";
import { DEMO_LEADS } from "./seed-data.mjs";

/** Converte "há N dias" em um ISO timestamp. */
function daysAgoToIso(days, hour = 10) {
  if (days === null || days === undefined) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const db = openDb();

const existing = db.prepare("SELECT COUNT(*) AS n FROM leads").get();
if (Number(existing.n) > 0) {
  console.error(
    `O banco já contém ${existing.n} leads (${DB_PATH}).\n` +
      `Rode "npm run db:reset" antes, ou "npm run setup" para fazer os dois.`,
  );
  process.exit(1);
}

const insertLead = db.prepare(
  `INSERT INTO leads
     (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);
const insertHistory = db.prepare(
  "INSERT INTO history (id, lead_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)",
);

db.exec("BEGIN");
try {
  for (const lead of DEMO_LEADS) {
    const id = randomUUID();
    insertLead.run(
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
    );

    for (const event of lead.history ?? []) {
      insertHistory.run(randomUUID(), id, event.type, event.message, daysAgoToIso(event.daysAgo, 11));
    }
  }
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
}

const leads = db.prepare("SELECT COUNT(*) AS n FROM leads").get();
const history = db.prepare("SELECT COUNT(*) AS n FROM history").get();
db.close();

console.log(`Seed aplicado em ${DB_PATH}`);
console.log(`  ${leads.n} leads fictícios`);
console.log(`  ${history.n} eventos de histórico`);
console.log("Lembrete: todos os dados são fictícios, apenas para demonstração.");
