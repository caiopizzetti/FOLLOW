import { MetricCardSkeleton, RowSkeleton, Skeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Carregando o painel">
      <div>
        <Skeleton className="h-4 w-64" />
        <Skeleton className="mt-3 h-10 w-96 max-w-full" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <div>
        <Skeleton className="h-5 w-48" />
        <div className="card mt-3 divide-y divide-[var(--color-line)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
