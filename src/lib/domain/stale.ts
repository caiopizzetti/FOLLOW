import { followUpConfig } from "../config";
import { daysBetween, toCivilDay } from "../format";
import { CLOSED_STATUSES, type Lead, type LeadInsight, type Priority } from "./types";

/**
 * Deteccao de leads parados.
 *
 * Regra deliberadamente simples, deterministica e explicavel — sem IA.
 * Todos os limites vivem em src/lib/config.ts.
 */

/** Um lead so entra na fila se ainda estiver em aberto. */
export function isOpen(lead: Lead): boolean {
  return !CLOSED_STATUSES.includes(lead.status);
}

/**
 * O lead tem historico suficiente para cobrar um retorno?
 * Ou ja houve contato/orcamento, ou e um lead novo que nunca recebeu retorno
 * (controlado por followUpConfig.includeNeverContacted).
 */
export function isEngageable(lead: Lead): boolean {
  if (lead.lastContactAt) return true;
  if (lead.status === "ORCAMENTO" || lead.status === "NEGOCIACAO" || lead.status === "CONTATO") {
    return true;
  }
  return followUpConfig.includeNeverContacted;
}

export function priorityFor(daysStalled: number): Priority {
  const { critical, warning } = followUpConfig.thresholds;
  if (daysStalled >= critical) return "CRITICO";
  if (daysStalled >= warning) return "ATENCAO";
  return "NORMAL";
}

function buildReason(lead: Lead, daysStalled: number, needsAction: boolean): string {
  if (!isOpen(lead)) {
    return lead.status === "GANHO"
      ? "Oportunidade ganha — nenhuma ação necessária."
      : "Oportunidade perdida — nenhuma ação necessária.";
  }

  if (!isEngageable(lead)) {
    return "Ainda sem contato registrado.";
  }

  const tempo =
    daysStalled <= 0
      ? "hoje"
      : daysStalled === 1
        ? "há 1 dia"
        : `há ${daysStalled} dias`;

  if (!needsAction) {
    return daysStalled <= 0
      ? "Interação registrada hoje."
      : `Sem interação ${tempo} — ainda dentro do prazo.`;
  }

  if (!lead.lastContactAt) {
    return `Entrou ${tempo} e nunca foi contatado.`;
  }

  switch (lead.status) {
    case "ORCAMENTO":
      return `Orçamento enviado e sem resposta ${tempo}.`;
    case "NEGOCIACAO":
      return `Negociação parada ${tempo}.`;
    default:
      return `Sem interação ${tempo}.`;
  }
}

/**
 * Enriquece um lead com tudo que a UI precisa: dias parados, prioridade,
 * se precisa de acao e o motivo em linguagem humana.
 *
 * @param now instante de referencia — injetado para tornar a funcao testavel.
 */
export function analyseLead(lead: Lead, now: Date = new Date()): LeadInsight {
  const referenceAt = lead.lastContactAt ?? lead.createdAt;
  const daysStalled = Math.max(0, daysBetween(referenceAt, now));

  const open = isOpen(lead);
  const engageable = isEngageable(lead);
  const priority = open && engageable ? priorityFor(daysStalled) : "NORMAL";
  const needsAction =
    open && engageable && daysStalled >= followUpConfig.thresholds.warning;

  const today = toCivilDay(now);
  const dueToday = Boolean(
    open && lead.nextFollowUpAt && toCivilDay(lead.nextFollowUpAt) <= today,
  );

  return {
    lead,
    referenceAt,
    daysStalled,
    priority,
    needsAction,
    reason: buildReason(lead, daysStalled, needsAction),
    dueToday,
  };
}

export function analyseLeads(leads: Lead[], now: Date = new Date()): LeadInsight[] {
  return leads.map((lead) => analyseLead(lead, now));
}

const PRIORITY_RANK: Record<Priority, number> = {
  CRITICO: 0,
  ATENCAO: 1,
  NORMAL: 2,
};

/**
 * Ordenacao padrao do produto:
 *   1. quem precisa de acao primeiro
 *   2. criticos antes de atencao
 *   3. maior valor
 *   4. mais tempo parado
 */
export function sortByUrgency(a: LeadInsight, b: LeadInsight): number {
  if (a.needsAction !== b.needsAction) return a.needsAction ? -1 : 1;
  const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (rank !== 0) return rank;
  if (b.lead.value !== a.lead.value) return b.lead.value - a.lead.value;
  return b.daysStalled - a.daysStalled;
}
