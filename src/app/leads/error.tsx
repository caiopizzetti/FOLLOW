"use client";

import { ErrorState } from "@/components/error-state";

export default function LeadsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Não foi possível carregar as oportunidades"
      description="Houve um erro ao ler a lista do banco."
      error={error}
      reset={reset}
    />
  );
}
