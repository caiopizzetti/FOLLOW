/**
 * Blocos de carregamento. Repetem a forma real da tela para que nada "pule"
 * quando o conteúdo chega.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="card p-5">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-9 w-36" />
    </div>
  );
}
