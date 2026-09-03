/**
 * Gera scripts/seed.sql a partir de scripts/seed-data.mjs.
 *
 * O arquivo resultante pode ser colado no console SQL do Turso (ou de
 * qualquer SQLite), permitindo popular a base de demonstração sem terminal.
 *
 * As datas usam funções de data do SQLite (date('now','-N days')), então
 * continuam relativas ao momento em que o SQL for executado — os leads
 * "parados há 8 dias" continuam parados há 8 dias.
 */
import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { DEMO_LEADS } from "./seed-data.mjs";

const ROOT = process.cwd();
const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
/** Data relativa, ancorada ao meio-dia UTC para não cruzar fronteira de dia. */
const d = (days) =>
  days === null || days === undefined ? "NULL" : `date('now','-${days} days') || 'T12:00:00Z'`;

const out = [];
out.push("-- ============================================================");
out.push("--  FOLLOW — base de DEMONSTRAÇÃO");
out.push("--  DADOS 100% FICTÍCIOS. Nenhuma pessoa, empresa, telefone,");
out.push("--  e-mail ou valor abaixo é real.");
out.push("-- ------------------------------------------------------------");
out.push("--  Gerado por: npm run db:sql");
out.push("--  Cole no console SQL do Turso para popular a base.");
out.push("--  As datas são relativas a QUANDO este SQL rodar.");
out.push("-- ============================================================");
out.push("");
out.push("-- 1. Tabelas");
out.push(readFileSync(path.join(ROOT, "src", "lib", "db", "schema.sql"), "utf8").trim());
out.push("");
out.push("-- 2. Limpa qualquer conteúdo anterior");
out.push("DELETE FROM history;");
out.push("DELETE FROM leads;");
out.push("");
out.push("-- 3. Leads fictícios");

for (const lead of DEMO_LEADS) {
  const id = randomUUID();
  out.push("");
  out.push(`-- ${lead.name} — ${lead.company ?? "sem empresa"}`);
  out.push(
    `INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES (` +
      [
        q(id),
        q(lead.name),
        q(lead.phone),
        q(lead.email),
        q(lead.company),
        lead.value,
        q(lead.status),
        q(lead.source),
        d(lead.createdDaysAgo),
        d(lead.lastContactDaysAgo),
        d(lead.nextFollowUpDaysAgo),
        q(lead.notes),
      ].join(", ") +
      ");",
  );
  for (const e of lead.history ?? []) {
    out.push(
      `INSERT INTO history (id, lead_id, type, message, created_at) VALUES (` +
        [q(randomUUID()), q(id), q(e.type), q(e.message), d(e.daysAgo)].join(", ") +
        ");",
    );
  }
}

out.push("");
out.push("-- Conferência: devem aparecer 18 leads.");
out.push("SELECT COUNT(*) AS leads FROM leads;");
out.push("SELECT COUNT(*) AS eventos FROM history;");
out.push("");

const target = path.join(ROOT, "scripts", "seed.sql");
writeFileSync(target, out.join("\n"));
console.log(`Gerado: ${target}`);
console.log(`  ${DEMO_LEADS.length} leads, ${out.length} linhas`);
