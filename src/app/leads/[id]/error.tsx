"use client";

import { ErrorState } from "@/components/error-state";

export default function LeadError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Não foi possível carregar esta oportunidade"
      description="Houve um erro ao ler os dados do lead ou o histórico."
      error={error}
      reset={reset}
    />
  );
}
