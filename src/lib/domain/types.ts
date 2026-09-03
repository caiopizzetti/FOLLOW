export const LEAD_STATUSES = [
  "NOVO",
  "CONTATO",
  "ORCAMENTO",
  "NEGOCIACAO",
  "GANHO",
  "PERDIDO",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const CLOSED_STATUSES: readonly LeadStatus[] = ["GANHO", "PERDIDO"];

export const HISTORY_TYPES = [
  "CONTACT",
  "FOLLOW_UP",
  "RESPONSE",
  "STATUS_CHANGE",
  "NOTE",
] as const;

export type HistoryType = (typeof HISTORY_TYPES)[number];

/** Nivel de urgencia calculado a partir dos dias sem interacao. */
export type Priority = "CRITICO" | "ATENCAO" | "NORMAL";

export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  /** Valor da oportunidade em reais. */
  value: number;
  status: LeadStatus;
  source: string | null;
  createdAt: string;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  notes: string | null;
}

export interface HistoryEntry {
  id: string;
  leadId: string;
  type: HistoryType;
  message: string;
  createdAt: string;
}

/**
 * Lead + tudo que a interface precisa saber para decidir o que mostrar.
 * Calculado no servidor para que a UI nunca faca conta de data.
 */
export interface LeadInsight {
  lead: Lead;
  /** Data usada como referencia da ultima interacao (lastContactAt ?? createdAt). */
  referenceAt: string;
  /** Dias inteiros desde a ultima interacao. */
  daysStalled: number;
  priority: Priority;
  /** true quando o lead deve aparecer na fila "precisa de acao". */
  needsAction: boolean;
  /** Frase curta explicando por que o lead foi (ou nao foi) sinalizado. */
  reason: string;
  /** true quando ha follow-up agendado para hoje ou vencido. */
  dueToday: boolean;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: "Novo",
  CONTATO: "Em contato",
  ORCAMENTO: "Orçamento enviado",
  NEGOCIACAO: "Em negociação",
  GANHO: "Ganho",
  PERDIDO: "Perdido",
};

export const HISTORY_LABELS: Record<HistoryType, string> = {
  CONTACT: "Contato",
  FOLLOW_UP: "Follow-up",
  RESPONSE: "Resposta do cliente",
  STATUS_CHANGE: "Mudança de status",
  NOTE: "Anotação",
};

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value);
}

export function isHistoryType(value: unknown): value is HistoryType {
  return typeof value === "string" && (HISTORY_TYPES as readonly string[]).includes(value);
}
