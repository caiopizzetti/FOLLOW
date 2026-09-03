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
import { getDb } from "./client";

/**
 * Camada de acesso a dados. Todo SQL do produto mora aqui — as telas so
 * chamam funcoes tipadas.
 */

interface LeadRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  value: number;
  status: string;
  source: string | null;
  created_at: string;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
}

interface HistoryRow {
  id: string;
  lead_id: string;
  type: string;
  message: string;
  created_at: string;
}

function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    company: row.company,
    value: Number(row.value),
    status: row.status as LeadStatus,
    source: row.source,
    createdAt: row.created_at,
    lastContactAt: row.last_contact_at,
    nextFollowUpAt: row.next_follow_up_at,
    notes: row.notes,
  };
}

function toHistoryEntry(row: HistoryRow): HistoryEntry {
  return {
    id: row.id,
    leadId: row.lead_id,
    type: row.type as HistoryType,
    message: row.message,
    createdAt: row.created_at,
  };
}

/* ------------------------------------------------------------------ leitura */

export function listLeads(): Lead[] {
  const rows = getDb()
    .prepare("SELECT * FROM leads ORDER BY created_at DESC")
    .all() as unknown as LeadRow[];
  return rows.map(toLead);
}

export function getLead(id: string): Lead | null {
  const row = getDb().prepare("SELECT * FROM leads WHERE id = ?").get(id) as
    | unknown
    | undefined;
  return row ? toLead(row as LeadRow) : null;
}

export function getHistory(leadId: string): HistoryEntry[] {
  const rows = getDb()
    .prepare("SELECT * FROM history WHERE lead_id = ? ORDER BY created_at ASC, rowid ASC")
    .all(leadId) as unknown as HistoryRow[];
  return rows.map(toHistoryEntry);
}

/** Todos os leads ja enriquecidos e ordenados pela urgencia do produto. */
export function listInsights(now: Date = new Date()): LeadInsight[] {
  return analyseLeads(listLeads(), now).sort(sortByUrgency);
}

export function getInsight(id: string, now: Date = new Date()): LeadInsight | null {
  const lead = getLead(id);
  return lead ? analyseLead(lead, now) : null;
}

/* ------------------------------------------------------------------ escrita */

function insertHistory(
  leadId: string,
  type: HistoryType,
  message: string,
  createdAt: string = new Date().toISOString(),
): void {
  getDb()
    .prepare("INSERT INTO history (id, lead_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(randomUUID(), leadId, type, message, createdAt);
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

export function createLead(input: CreateLeadInput): Lead {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  const status = input.status ?? "NOVO";

  /**
   * Um lead criado ja em CONTATO/ORCAMENTO/NEGOCIACAO representa uma conversa
   * que ja aconteceu, entao contamos "agora" como ultima interacao. Um lead
   * NOVO nasce sem contato — e por isso comeca a envelhecer imediatamente.
   */
  const alreadyEngaged = status !== "NOVO" && status !== "PERDIDO" && status !== "GANHO";
  const lastContactAt = alreadyEngaged ? now : null;

  db.prepare(
    `INSERT INTO leads
      (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.name.trim(),
    input.phone?.trim() || null,
    input.email?.trim() || null,
    input.company?.trim() || null,
    input.value ?? 0,
    status,
    input.source?.trim() || null,
    now,
    lastContactAt,
    null,
    input.notes?.trim() || null,
  );

  insertHistory(id, "NOTE", `Oportunidade cadastrada com status ${STATUS_LABELS[status]}.`, now);

  const lead = getLead(id);
  if (!lead) throw new Error("Falha ao criar a oportunidade.");
  return lead;
}

/**
 * Acao central do produto: o vendedor fez o contato.
 *
 * Atualiza lastContactAt, agenda o proximo follow-up, registra o historico e
 * — como consequencia — zera os dias parados e tira o lead da fila de alertas.
 */
export function markAsContacted(leadId: string, message?: string): void {
  const lead = getLead(leadId);
  if (!lead) throw new Error("Oportunidade não encontrada.");

  const now = new Date();
  const nowIso = now.toISOString();
  const nextFollowUp = new Date(now);
  nextFollowUp.setDate(nextFollowUp.getDate() + followUpConfig.nextFollowUpInDays);

  getDb()
    .prepare("UPDATE leads SET last_contact_at = ?, next_follow_up_at = ? WHERE id = ?")
    .run(nowIso, nextFollowUp.toISOString(), leadId);

  const trimmed = message?.trim();
  insertHistory(
    leadId,
    "FOLLOW_UP",
    trimmed ? `Follow-up realizado: "${trimmed}"` : "Follow-up realizado.",
    nowIso,
  );

  // Um lead NOVO que acabou de receber follow-up ja esta, na pratica, em contato.
  if (lead.status === "NOVO") {
    updateStatus(leadId, "CONTATO", { silent: true });
    insertHistory(leadId, "STATUS_CHANGE", "Status alterado para Em contato.", nowIso);
  }
}

export function updateStatus(
  leadId: string,
  status: LeadStatus,
  options: { silent?: boolean } = {},
): void {
  const lead = getLead(leadId);
  if (!lead) throw new Error("Oportunidade não encontrada.");
  if (lead.status === status) return;

  const db = getDb();
  const nowIso = new Date().toISOString();

  // Ganho/perdido encerram o ciclo: nao faz sentido manter follow-up agendado.
  const clearFollowUp = status === "GANHO" || status === "PERDIDO";

  db.prepare(
    `UPDATE leads
        SET status = ?,
            next_follow_up_at = CASE WHEN ? = 1 THEN NULL ELSE next_follow_up_at END
      WHERE id = ?`,
  ).run(status, clearFollowUp ? 1 : 0, leadId);

  if (!options.silent) {
    insertHistory(
      leadId,
      "STATUS_CHANGE",
      `Status alterado de ${STATUS_LABELS[lead.status]} para ${STATUS_LABELS[status]}.`,
      nowIso,
    );
  }
}

export function addNote(leadId: string, message: string): void {
  const trimmed = message.trim();
  if (!trimmed) return;
  insertHistory(leadId, "NOTE", trimmed);
}

/** Registra que o cliente respondeu — tambem conta como interacao. */
export function registerResponse(leadId: string, message: string): void {
  const nowIso = new Date().toISOString();
  getDb().prepare("UPDATE leads SET last_contact_at = ? WHERE id = ?").run(nowIso, leadId);
  insertHistory(leadId, "RESPONSE", message.trim() || "Cliente respondeu.", nowIso);
}

/* ------------------------------------------------------------------ metricas */

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
 * registrado nesta ferramenta antes de fechar. E um numero derivado de dados
 * reais do banco, nao um valor inventado.
 */
function recoveredStats(): { count: number; value: number } {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS count, COALESCE(SUM(l.value), 0) AS value
         FROM leads l
        WHERE l.status = 'GANHO'
          AND EXISTS (
            SELECT 1 FROM history h
             WHERE h.lead_id = l.id AND h.type = 'FOLLOW_UP'
          )`,
    )
    .get() as unknown as { count: number; value: number };
  return { count: Number(row.count), value: Number(row.value) };
}

export function getDashboardMetrics(now: Date = new Date()): DashboardMetrics {
  const insights = analyseLeads(listLeads(), now);
  const stalled = insights.filter((i) => i.needsAction);
  const critical = stalled.filter((i) => i.priority === "CRITICO");
  const recovered = recoveredStats();

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
