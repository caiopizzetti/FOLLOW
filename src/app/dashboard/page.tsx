import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Flame,
  TrendingUp,
  Users,
  Wallet,
  PartyPopper,
} from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { PriorityBadge } from "@/components/badges";
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
      {/* ---------------------------------------------- bloco principal */}
      <section>
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink-soft)]">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Oportunidades paradas
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {metrics.stalledLeads === 0 ? (
            <>Nenhuma oportunidade parada.</>
          ) : (
            <>
              {metrics.stalledLeads}{" "}
              {metrics.stalledLeads === 1 ? "oportunidade precisa" : "oportunidades precisam"} de
              ação
            </>
          )}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]">
          {metrics.stalledLeads === 0
            ? "Todo mundo recebeu retorno dentro do prazo. Nada escapando por falta de follow-up."
            : `São ${formatCurrency(metrics.stalledValue)} em negócios que pararam de andar. Comece pelos críticos.`}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Precisam de ação"
            value={String(metrics.stalledLeads)}
            hint={`Sem interação há ${followUpConfig.thresholds.warning}+ dias`}
            icon={AlertTriangle}
            tone={metrics.stalledLeads > 0 ? "alert" : "default"}
          />
          <MetricCard
            label="Em oportunidades paradas"
            value={formatCurrency(metrics.stalledValue)}
            hint="Valor total em risco"
            icon={Wallet}
          />
          <MetricCard
            label={`Sem follow-up há ${critical}+ dias`}
            value={String(metrics.criticalLeads)}
            hint="Nível crítico"
            icon={Flame}
            tone={metrics.criticalLeads > 0 ? "alert" : "default"}
          />
          <MetricCard
            label="Em oportunidades críticas"
            value={formatCurrency(metrics.criticalValue)}
            hint="O que você perde se não agir"
            icon={TrendingUp}
            tone={metrics.criticalValue > 0 ? "alert" : "default"}
          />
        </div>
      </section>

      {/* --------------------------------------------------- fila de ação */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Oportunidades que precisam de ação
            </h2>
            <p className="text-sm text-[var(--color-ink-soft)]">
              Ordenadas por urgência e valor.
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
            <p className="mt-3 font-medium">Fila vazia.</p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              Nenhuma oportunidade está parada além do prazo.
            </p>
          </div>
        ) : (
          <ul className="card divide-y divide-[var(--color-line)] overflow-hidden">
            {queue.map(({ lead, daysStalled, priority, reason }) => (
              <li key={lead.id}>
                <Link
                  href={`/leads/${lead.id}`}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{lead.name}</p>
                    <p className="truncate text-sm text-[var(--color-ink-soft)]">
                      {lead.company ?? "Sem empresa"} · {reason}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:flex-nowrap sm:gap-6">
                    <span className="font-semibold tabular-nums sm:w-28 sm:text-right">
                      {formatCurrency(lead.value)}
                    </span>
                    <span className="text-sm text-[var(--color-ink-soft)] tabular-nums sm:w-28 sm:text-right">
                      {formatStalledDays(daysStalled)}
                    </span>
                    <span className="sm:w-24">
                      <PriorityBadge priority={priority} />
                    </span>
                    <span className="btn-secondary hidden shrink-0 whitespace-nowrap sm:inline-flex">
                      Fazer follow-up
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------ métricas de apoio */}
      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Resumo da base</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Oportunidades ativas"
            value={String(metrics.activeLeads)}
            hint="Nem ganhas, nem perdidas"
            icon={Users}
          />
          <MetricCard
            label="Follow-ups para hoje"
            value={String(metrics.dueTodayLeads)}
            hint="Agendados para hoje ou vencidos"
            icon={CalendarClock}
          />
          <MetricCard
            label="Oportunidades recuperadas"
            value={`${metrics.recoveredLeads} · ${formatCurrency(metrics.recoveredValue)}`}
            hint="Ganhas depois de um follow-up registrado aqui"
            icon={TrendingUp}
            tone={metrics.recoveredLeads > 0 ? "positive" : "default"}
          />
        </div>
      </section>
    </div>
  );
}
