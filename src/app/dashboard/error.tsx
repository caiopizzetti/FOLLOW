"use client";

import { ErrorState } from "@/components/error-state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Não foi possível carregar o painel"
      description="Houve um erro ao ler as oportunidades do banco."
      error={error}
      reset={reset}
    />
  );
}
