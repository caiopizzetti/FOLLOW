import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  PartyPopper,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { PriorityBadge, StatusBadge } from "@/components/badges";
import { MetricCard } from "@/components/metric-card";
import { followUpConfig } from "@/lib/config";
import { getDashboardMetrics, listInsights } from "@/lib/db/queries";
import { formatCurrency, formatStalledDays } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const now = new Date();
  const metrics = getDashboardMetrics(now);
  const queue = listInsights(now).filter((i) => i.needsAction);
  const { critical } = followUpConfig.thresholds;

  return (
    <div className="space-y-8">
      {/* --------------------------------------------------------- resumo */}
      <section>
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink-soft)]">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Central de recuperação de oportunidades
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {metrics.stalledLeads === 0 ? (
            <>Nenhuma oportunidade parada.</>
          ) : (
            <>
              {formatCurrency(metrics.stalledValue)} parados em{" "}
              {metrics.stalledLeads}{" "}
              {metrics.stalledLeads === 1 ? "oportunidade" : "oportunidades"}
            </>
          )}
        </h1>

        <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]">
          {metrics.stalledLeads === 0 ? (
            "Todo mundo recebeu retorno dentro do prazo. Nada escapando por falta de follow-up."
          ) : (
            <>
              Destes,{" "}
              <strong className="font-semibold text-red-600">
                {metrics.criticalLeads} estão críticos
              </strong>{" "}
              (sem follow-up há {critical}+ dias), somando{" "}
              {formatCurrency(metrics.criticalValue)}. Comece por eles.
            </>
          )}
        </p>
      </section>

      {/* ---------------------------------------------------------- cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Leads ativos"
          value={String(metrics.activeLeads)}
          hint="Nem ganhos, nem perdidos"
          icon={Users}
        />
        <MetricCard
          label="Oportunidades paradas"
          value={String(metrics.stalledLeads)}
          hint={`Sem interação há ${followUpConfig.thresholds.warning}+ dias`}
          icon={AlertTriangle}
          tone={metrics.stalledLeads > 0 ? "alert" : "default"}
        />
        <MetricCard
          label="Valor em oportunidades paradas"
          value={formatCurrency(metrics.stalledValue)}
          hint="Dinheiro que pode escapar"
          icon={Wallet}
          tone={metrics.stalledValue > 0 ? "alert" : "default"}
        />
        <MetricCard
          label="Follow-ups para hoje"
          value={String(metrics.dueTodayLeads)}
          hint="Agendados para hoje ou vencidos"
          icon={CalendarClock}
        />
      </section>

      {/* ------------------------------------------- precisam de atenção */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Precisam de atenção</h2>
            <p className="text-sm text-[var(--color-ink-soft)]">
              Ordenadas por prioridade, depois por valor e tempo parado.
            </p>
          </div>
          <Link
            href="/leads"
            className="shrink-0 text-sm font-medium text-[var(--color-brand)] hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {queue.length === 0 ? (
          <div className="card p-10 text-center">
            <PartyPopper className="mx-auto h-7 w-7 text-emerald-500" />
            <p className="mt-3 font-medium">Nada parado por aqui.</p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              Nenhuma oportunidade passou do prazo de follow-up.
            </p>
            <Link href="/leads" className="btn-secondary mt-5">
              Ver todas as oportunidades
            </Link>
          </div>
        ) : (
          <ul className="card divide-y divide-[var(--color-line)] overflow-hidden">
            {queue.map(({ lead, daysStalled, priority, reason }) => (
              <li
                key={lead.id}
                className="flex flex-col gap-4 p-5 transition-colors hover:bg-gray-50 lg:flex-row lg:items-center"
              >
                <div className="min-w-0 flex-1">
                  {/* nome + status + prioridade */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <StatusBadge status={lead.status} />
                    <PriorityBadge priority={priority} />
                  </div>

                  {/* empresa */}
                  <p className="mt-1 truncate text-sm text-[var(--color-ink-soft)]">
                    {lead.company ?? "Sem empresa"}
                  </p>

                  {/* motivo do alerta */}
                  <p
                    className={`mt-2 flex items-start gap-1.5 text-sm ${
                      priority === "CRITICO" ? "text-red-700" : "text-amber-700"
                    }`}
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {reason}
                  </p>
                </div>

                {/* valor + tempo + ação */}
                <div className="flex items-center justify-between gap-5 lg:justify-end">
                  <div className="lg:w-32 lg:text-right">
                    <p className="text-lg font-semibold tabular-nums">
                      {formatCurrency(lead.value)}
                    </p>
                    <p className="text-xs text-[var(--color-ink-faint)] tabular-nums">
                      {formatStalledDays(daysStalled)}
                    </p>
                  </div>

                  <Link
                    href={`/leads/${lead.id}`}
                    className="btn-secondary shrink-0 whitespace-nowrap"
                  >
                    Ver oportunidade
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ----------------------------------------------------- recuperado */}
      {metrics.recoveredLeads > 0 && (
        <section className="card flex flex-wrap items-center gap-x-3 gap-y-1 border-emerald-200 bg-emerald-50 px-5 py-4 text-sm">
          <TrendingUp className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-medium text-emerald-900">
            {metrics.recoveredLeads}{" "}
            {metrics.recoveredLeads === 1
              ? "oportunidade recuperada"
              : "oportunidades recuperadas"}{" "}
            · {formatCurrency(metrics.recoveredValue)}
          </span>
          <span className="text-emerald-800">
            fechadas depois de um follow-up registrado aqui.
          </span>
        </section>
      )}
    </div>
  );
}
