/**
 * Skeleton da LISTA de oportunidades.
 *
 * Vive dentro do route group (list) de propósito. Um loading.tsx em
 * src/app/leads/ embrulharia tambem /leads/[id] num Suspense, e o Next
 * libera o shell com status 200 antes do notFound() rodar — o que faria
 * um lead inexistente responder 200 em vez de 404. O route group isola
 * este boundary na lista, sem mudar a URL.
 */
import { RowSkeleton, Skeleton } from "@/components/skeleton";

export default function LeadsLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Carregando as oportunidades">
      <div>
        <Skeleton className="h-7 w-52" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-28 rounded-full" />
        ))}
      </div>

      <div className="card divide-y divide-[var(--color-line)]">
        {Array.from({ length: 8 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
