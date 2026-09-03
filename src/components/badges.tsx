import { AlertTriangle, Clock, CheckCircle2, XCircle, Circle } from "lucide-react";

import { STATUS_LABELS, type LeadStatus, type Priority } from "@/lib/domain/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  CRITICO: "bg-red-50 text-red-700",
  ATENCAO: "bg-amber-50 text-amber-700",
  NORMAL: "bg-gray-100 text-[var(--color-ink-soft)]",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  CRITICO: "Crítico",
  ATENCAO: "Atenção",
  NORMAL: "Normal",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const Icon = priority === "CRITICO" ? AlertTriangle : priority === "ATENCAO" ? Clock : Circle;
  return (
    <span className={`chip ${PRIORITY_STYLES[priority]}`}>
      <Icon className="h-3.5 w-3.5" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  NOVO: "bg-sky-50 text-sky-700",
  CONTATO: "bg-violet-50 text-violet-700",
  ORCAMENTO: "bg-indigo-50 text-indigo-700",
  NEGOCIACAO: "bg-purple-50 text-purple-700",
  GANHO: "bg-emerald-50 text-emerald-700",
  PERDIDO: "bg-gray-100 text-gray-600",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`chip ${STATUS_STYLES[status]}`}>
      {status === "GANHO" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {status === "PERDIDO" && <XCircle className="h-3.5 w-3.5" />}
      {STATUS_LABELS[status]}
    </span>
  );
}
