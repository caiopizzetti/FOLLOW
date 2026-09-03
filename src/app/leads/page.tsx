import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";

import { PriorityBadge, StatusBadge } from "@/components/badges";
import { isOpen } from "@/lib/domain/stale";
import { listInsights } from "@/lib/db/queries";
import type { LeadInsight } from "@/lib/domain/types";
import { formatCurrency, formatDate, formatStalledDays } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Filtros da tela. O produto tem poucos, e todos respondem a uma pergunta real. */
const FILTERS = {
  todos: { label: "Todos", test: () => true },
  acao: { label: "Precisam de ação", test: (i: LeadInsight) => i.needsAction },
  criticos: {
    label: "Críticos",
    test: (i: LeadInsight) => i.needsAction && i.priority === "CRITICO",
  },
  hoje: { label: "Hoje", test: (i: LeadInsight) => i.dueToday },
  ganhos: { label: "Ganhos", test: (i: LeadInsight) => i.lead.status === "GANHO" },
  perdidos: { label: "Perdidos", test: (i: LeadInsight) => i.lead.status === "PERDIDO" },
} as const;

type FilterKey = keyof typeof FILTERS;

function isFilterKey(value: unknown): value is FilterKey {
  return typeof value === "string" && value in FILTERS;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro } = await searchParams;
  const active: FilterKey = isFilterKey(filtro) ? filtro : "todos";

  const all = listInsights();
  const rows = all.filter(FILTERS[active].test);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Oportunidades</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          {all.length} no total · {all.filter((i) => i.needsAction).length} precisando de ação ·{" "}
          {all.filter((i) => isOpen(i.lead)).length} ativas
        </p>
      </div>

      {/* -------------------------------------------------------- filtros */}
      <nav className="flex flex-wrap gap-2">
        {(Object.keys(FILTERS) as FilterKey[]).map((key) => {
          const count = all.filter(FILTERS[key].test).length;
          const selected = key === active;
          return (
            <Link
              key={key}
              href={key === "todos" ? "/leads" : `/leads?filtro=${key}`}
              aria-current={selected ? "page" : undefined}
              className={`chip border transition-colors ${
                selected
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                  : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:bg-gray-50"
              }`}
            >
              {FILTERS[key].label}
              <span className="tabular-nums opacity-60">{count}</span>
            </Link>
          );
        })}
      </nav>

      {/* --------------------------------------------------------- tabela */}
      {rows.length === 0 ? (
        <div className="card p-12 text-center">
          <Inbox className="mx-auto h-7 w-7 text-[var(--color-ink-faint)]" />
          <p className="mt-3 font-medium">Nada por aqui.</p>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Nenhuma oportunidade se encaixa neste filtro.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Empresa</th>
                  <th className="px-5 py-3 text-right font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Último contato</th>
                  <th className="px-5 py-3 text-right font-medium">Dias parado</th>
                  <th className="px-5 py-3 font-medium">Prioridade</th>
                  <th className="px-5 py-3 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {rows.map(({ lead, daysStalled, priority, needsAction }) => (
                  <tr key={lead.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-soft)]">
                      {lead.company ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                      {formatCurrency(lead.value)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-soft)] tabular-nums">
                      {formatDate(lead.lastContactAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {isOpen(lead) ? daysStalled : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {isOpen(lead) ? (
                        <PriorityBadge priority={priority} />
                      ) : (
                        <span className="text-[var(--color-ink-faint)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center gap-1.5 font-medium text-[var(--color-brand)] hover:underline"
                      >
                        {needsAction ? "Fazer follow-up" : "Abrir"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
