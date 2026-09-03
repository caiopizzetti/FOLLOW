import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  Tag,
} from "lucide-react";

import { PriorityBadge, StatusBadge } from "@/components/badges";
import { FollowUpPanel } from "@/components/follow-up-panel";
import { NoteForm } from "@/components/note-form";
import { getHistory, getInsight } from "@/lib/db/queries";
import { generateFollowUpMessage } from "@/lib/domain/follow-up";
import { isOpen } from "@/lib/domain/stale";
import { HISTORY_LABELS, type HistoryType } from "@/lib/domain/types";
import {
  formatCurrencyExact,
  formatDate,
  formatPhone,
  formatStalledDays,
  formatTimelineDate,
} from "@/lib/format";

export const dynamic = "force-dynamic";

const HISTORY_DOT: Record<HistoryType, string> = {
  CONTACT: "bg-indigo-500",
  FOLLOW_UP: "bg-amber-500",
  RESPONSE: "bg-emerald-500",
  STATUS_CHANGE: "bg-violet-500",
  NOTE: "bg-gray-400",
};

export default async function LeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ criado?: string }>;
}) {
  const { id } = await params;
  const { criado } = await searchParams;

  const insight = getInsight(id);
  if (!insight) notFound();

  const { lead, daysStalled, priority, needsAction, reason } = insight;
  const history = getHistory(lead.id);
  const suggestion = generateFollowUpMessage(insight);
  const open = isOpen(lead);

  return (
    <div className="space-y-6">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para oportunidades
      </Link>

      {criado === "1" && (
        <div
          role="status"
          className="card flex items-center gap-3 border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-900"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          Oportunidade cadastrada. Ela já entrou no cálculo do painel.
        </div>
      )}

      {/* ------------------------------------------------------ cabeçalho */}
      <header className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-[var(--color-ink-soft)]">
              <Building2 className="h-4 w-4 shrink-0" />
              {lead.company ?? "Sem empresa"}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatCurrencyExact(lead.value)}
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-faint)]">Valor da oportunidade</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--color-line)] pt-5">
          <StatusBadge status={lead.status} />
          {open && <PriorityBadge priority={priority} />}
          <span className="text-sm text-[var(--color-ink-soft)]">
            {open ? formatStalledDays(daysStalled) : "Ciclo encerrado"}
          </span>
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-4 border-t border-[var(--color-line)] pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail icon={Phone} label="Telefone" value={formatPhone(lead.phone)} />
          <Detail icon={Mail} label="E-mail" value={lead.email ?? "—"} />
          <Detail icon={Tag} label="Origem" value={lead.source ?? "—"} />
          <Detail icon={CalendarDays} label="Data de criação" value={formatDate(lead.createdAt)} />
          <Detail
            icon={MessageSquare}
            label="Último contato"
            value={lead.lastContactAt ? formatDate(lead.lastContactAt) : "Nunca contatado"}
          />
          <Detail
            icon={CalendarClock}
            label="Dias parado"
            value={open ? formatStalledDays(daysStalled) : "—"}
          />
        </dl>

        {lead.notes && (
          <div className="mt-5 border-t border-[var(--color-line)] pt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">
              Observações
            </p>
            <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">{lead.notes}</p>
          </div>
        )}
      </header>

      {/* ------------------------------------------------ por que está aqui */}
      <section className="card overflow-hidden">
        <header className="border-b border-[var(--color-line)] px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
            Por que está aqui?
          </h2>
        </header>
        <div className="p-6">
          <p
            className={`flex items-start gap-2.5 rounded-lg px-4 py-3 text-[15px] ${
              needsAction
                ? priority === "CRITICO"
                  ? "bg-red-50 font-medium text-red-800"
                  : "bg-amber-50 font-medium text-amber-800"
                : "bg-gray-50 text-[var(--color-ink-soft)]"
            }`}
          >
            <AlertTriangle
              className={`mt-0.5 h-4 w-4 shrink-0 ${needsAction ? "" : "opacity-40"}`}
            />
            {reason}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------- próxima ação */}
      <FollowUpPanel
        leadId={lead.id}
        status={lead.status}
        suggestion={suggestion.message}
        rationale={suggestion.rationale}
        needsAction={needsAction}
      />

      {/* -------------------------------------------------------- histórico */}
      <section className="card overflow-hidden">
        <header className="border-b border-[var(--color-line)] px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
            Histórico
          </h2>
        </header>

        <div className="p-6">
          {history.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)]">
              Nenhum registro ainda. Toda ação feita aqui aparece nesta linha do tempo.
            </p>
          ) : (
            <ol className="relative space-y-5 border-l border-[var(--color-line)] pl-6">
              {history.map((entry) => (
                <li key={entry.id} className="relative">
                  <span
                    className={`absolute -left-[1.8rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${HISTORY_DOT[entry.type]}`}
                  />
                  <div className="flex flex-wrap items-baseline gap-x-2.5">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatTimelineDate(entry.createdAt)}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                      {HISTORY_LABELS[entry.type]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">{entry.message}</p>
                </li>
              ))}

              {/* Alerta calculado, não persistido: fecha a linha do tempo. */}
              {needsAction && (
                <li className="relative">
                  <span className="absolute -left-[1.8rem] top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-white" />
                  <div className="flex flex-wrap items-baseline gap-x-2.5">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatTimelineDate(new Date().toISOString())}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-red-500">Alerta</span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-red-700">
                    ⚠️ Follow-up recomendado — {reason.toLowerCase()}
                  </p>
                </li>
              )}
            </ol>
          )}

          <div className="mt-6 border-t border-[var(--color-line)] pt-5">
            <NoteForm leadId={lead.id} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
