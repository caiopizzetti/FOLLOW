import { randomUUID } from "node:crypto";

import { followUpConfig } from "../config";
import { analyseLead, analyseLeads, isOpen, sortByUrgency } from "../domain/stale";
import type {
  HistoryEntry,
  HistoryType,
  Lead,
  LeadInsight,
  LeadStatus,
} from "../domain/types";
import { STATUS_LABELS } from "../domain/types";
import { db } from "./client";

/**
 * Camada de acesso a dados. Todo SQL do produto mora aqui — as telas só
 * chamam funções tipadas.
 *
 * O SQL é o mesmo desde a primeira versão: libSQL fala o dialeto do SQLite.
 * O que mudou foi a API do driver, que é assíncrona.
 */

type Row = Record<string, unknown>;

function str(value: unknown): string {
  return String(value ?? "");
}

function nullableStr(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function toLead(row: Row): Lead {
  return {
    id: str(row.id),
    name: str(row.name),
    phone: nullableStr(row.phone),
    email: nullableStr(row.email),
    company: nullableStr(row.company),
    value: Number(row.value ?? 0),
    status: str(row.status) as LeadStatus,
    source: nullableStr(row.source),
    createdAt: str(row.created_at),
    lastContactAt: nullableStr(row.last_contact_at),
    nextFollowUpAt: nullableStr(row.next_follow_up_at),
    notes: nullableStr(row.notes),
  };
}

function toHistoryEntry(row: Row): HistoryEntry {
  return {
    id: str(row.id),
    leadId: str(row.lead_id),
    type: str(row.type) as HistoryType,
    message: str(row.message),
    createdAt: str(row.created_at),
  };
}

/* ------------------------------------------------------------------ leitura */

export async function listLeads(): Promise<Lead[]> {
  const client = await db();
  const result = await client.execute("SELECT * FROM leads ORDER BY created_at DESC");
  return result.rows.map((row) => toLead(row as unknown as Row));
}

export async function getLead(id: string): Promise<Lead | null> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM leads WHERE id = ?",
    args: [id],
  });
  const row = result.rows[0];
  return row ? toLead(row as unknown as Row) : null;
}

export async function getHistory(leadId: string): Promise<HistoryEntry[]> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM history WHERE lead_id = ? ORDER BY created_at ASC, rowid ASC",
    args: [leadId],
  });
  return result.rows.map((row) => toHistoryEntry(row as unknown as Row));
}

/** Todos os leads já enriquecidos e ordenados pela urgência do produto. */
export async function listInsights(now: Date = new Date()): Promise<LeadInsight[]> {
  const leads = await listLeads();
  return analyseLeads(leads, now).sort(sortByUrgency);
}

export async function getInsight(
  id: string,
  now: Date = new Date(),
): Promise<LeadInsight | null> {
  const lead = await getLead(id);
  return lead ? analyseLead(lead, now) : null;
}

/* ------------------------------------------------------------------ escrita */

async function insertHistory(
  leadId: string,
  type: HistoryType,
  message: string,
  createdAt: string = new Date().toISOString(),
): Promise<void> {
  const client = await db();
  await client.execute({
    sql: "INSERT INTO history (id, lead_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [randomUUID(), leadId, type, message, createdAt],
  });
}

export interface CreateLeadInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  value?: number;
  status?: LeadStatus;
  source?: string | null;
  notes?: string | null;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const client = await db();
  const id = randomUUID();
  const now = new Date().toISOString();
  const status = input.status ?? "NOVO";

  /**
   * Um lead criado já em CONTATO/ORCAMENTO/NEGOCIACAO representa uma conversa
   * que já aconteceu, então contamos "agora" como última interação. Um lead
   * NOVO nasce sem contato — e por isso começa a envelhecer imediatamente.
   */
  const alreadyEngaged = status !== "NOVO" && status !== "PERDIDO" && status !== "GANHO";

  await client.batch(
    [
      {
        sql: `INSERT INTO leads
                (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          input.name.trim(),
          input.phone?.trim() || null,
          input.email?.trim() || null,
          input.company?.trim() || null,
          input.value ?? 0,
          status,
          input.source?.trim() || null,
          now,
          alreadyEngaged ? now : null,
          null,
          input.notes?.trim() || null,
        ],
      },
      {
        sql: "INSERT INTO history (id, lead_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [
          randomUUID(),
          id,
          "NOTE",
          `Oportunidade cadastrada com status ${STATUS_LABELS[status]}.`,
          now,
        ],
      },
    ],
    "write",
  );

  const lead = await getLead(id);
  if (!lead) throw new Error("Falha ao criar a oportunidade.");
  return lead;
}

/**
 * Ação central do produto: o vendedor fez o contato.
 *
 * Atualiza lastContactAt, agenda o próximo follow-up, registra o histórico e
 * — como consequência — zera os dias parados e tira o lead da fila de alertas.
 */
export async function markAsContacted(leadId: string, message?: string): Promise<void> {
  const lead = await getLead(leadId);
  if (!lead) throw new Error("Oportunidade não encontrada.");

  const client = await db();
  const now = new Date();
  const nowIso = now.toISOString();
  const nextFollowUp = new Date(now);
  nextFollowUp.setDate(nextFollowUp.getDate() + followUpConfig.nextFollowUpInDays);

  const trimmed = message?.trim();
  const statements = [
    {
      sql: "UPDATE leads SET last_contact_at = ?, next_follow_up_at = ? WHERE id = ?",
      args: [nowIso, nextFollowUp.toISOString(), leadId],
    },
    {
      sql: "INSERT INTO history (id, lead_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [
        randomUUID(),
        leadId,
        "FOLLOW_UP",
        trimmed ? `Follow-up realizado: "${trimmed}"` : "Follow-up realizado.",
        nowIso,
      ],
    },
  ];

  // Um lead NOVO que acabou de receber follow-up já está, na prática, em contato.
  if (lead.status === "NOVO") {
    statements.push(
      {
        sql: "UPDATE leads SET status = 'CONTATO' WHERE id = ?",
        args: [leadId],
      },
      {
        sql: "INSERT INTO history (id, lead_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [
          randomUUID(),
          leadId,
          "STATUS_CHANGE",
          "Status alterado para Em contato.",
          nowIso,
        ],
      },
    );
  }

  await client.batch(statements, "write");
}

export async function updateStatus(leadId: string, status: LeadStatus): Promise<void> {
  const lead = await getLead(leadId);
  if (!lead) throw new Error("Oportunidade não encontrada.");
  if (lead.status === status) return;

  const client = await db();
  const nowIso = new Date().toISOString();

  // Ganho/perdido encerram o ciclo: não faz sentido manter follow-up agendado.
  const clearFollowUp = status === "GANHO" || status === "PERDIDO";

  await client.batch(
    [
      {
        sql: clearFollowUp
          ? "UPDATE leads SET status = ?, next_follow_up_at = NULL WHERE id = ?"
          : "UPDATE leads SET status = ? WHERE id = ?",
        args: [status, leadId],
      },
      {
        sql: "INSERT INTO history (id, lead_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [
          randomUUID(),
          leadId,
          "STATUS_CHANGE",
          `Status alterado de ${STATUS_LABELS[lead.status]} para ${STATUS_LABELS[status]}.`,
          nowIso,
        ],
      },
    ],
    "write",
  );
}

export async function addNote(leadId: string, message: string): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) return;
  await insertHistory(leadId, "NOTE", trimmed);
}

/** Registra que o cliente respondeu — também conta como interação. */
export async function registerResponse(leadId: string, message: string): Promise<void> {
  const client = await db();
  const nowIso = new Date().toISOString();
  await client.batch(
    [
      {
        sql: "UPDATE leads SET last_contact_at = ? WHERE id = ?",
        args: [nowIso, leadId],
      },
      {
        sql: "INSERT INTO history (id, lead_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [randomUUID(), leadId, "RESPONSE", message.trim() || "Cliente respondeu.", nowIso],
      },
    ],
    "write",
  );
}

/* ------------------------------------------------------------------ métricas */

export interface DashboardMetrics {
  activeLeads: number;
  stalledLeads: number;
  stalledValue: number;
  criticalLeads: number;
  criticalValue: number;
  dueTodayLeads: number;
  recoveredLeads: number;
  recoveredValue: number;
}

/**
 * "Recuperado" = oportunidade GANHO que recebeu pelo menos um follow-up
 * registrado nesta ferramenta antes de fechar. É um número derivado de dados
 * reais do banco, não um valor inventado.
 */
async function recoveredStats(): Promise<{ count: number; value: number }> {
  const client = await db();
  const result = await client.execute(
    `SELECT COUNT(*) AS count, COALESCE(SUM(l.value), 0) AS value
       FROM leads l
      WHERE l.status = 'GANHO'
        AND EXISTS (
          SELECT 1 FROM history h
           WHERE h.lead_id = l.id AND h.type = 'FOLLOW_UP'
        )`,
  );
  const row = result.rows[0] as unknown as Row;
  return { count: Number(row.count ?? 0), value: Number(row.value ?? 0) };
}

export async function getDashboardMetrics(
  now: Date = new Date(),
): Promise<DashboardMetrics> {
  const leads = await listLeads();
  const insights = analyseLeads(leads, now);
  const stalled = insights.filter((i) => i.needsAction);
  const critical = stalled.filter((i) => i.priority === "CRITICO");
  const recovered = await recoveredStats();

  return {
    activeLeads: insights.filter((i) => isOpen(i.lead)).length,
    stalledLeads: stalled.length,
    stalledValue: stalled.reduce((sum, i) => sum + i.lead.value, 0),
    criticalLeads: critical.length,
    criticalValue: critical.reduce((sum, i) => sum + i.lead.value, 0),
    dueTodayLeads: insights.filter((i) => i.dueToday).length,
    recoveredLeads: recovered.count,
    recoveredValue: recovered.value,
  };
}
