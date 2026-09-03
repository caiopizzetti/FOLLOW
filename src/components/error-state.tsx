"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title: string;
  description: string;
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Estado de erro compartilhado pelos error boundaries das rotas.
 *
 * Mostra a mensagem real do erro: é uma ferramenta interna rodando local, e
 * esconder a causa só faz o usuário perder tempo para descobrir que esqueceu
 * de rodar `npm run setup`.
 */
export function ErrorState({ title, description, error, reset }: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isMissingDatabase = /no such table|unable to open database/i.test(error.message);

  return (
    <div className="card mx-auto max-w-lg p-10 text-center" role="alert">
      <AlertOctagon className="mx-auto h-8 w-8 text-red-500" />
      <h1 className="mt-4 text-lg font-semibold">{title}</h1>
      <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">{description}</p>

      {isMissingDatabase && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-left text-sm text-amber-900">
          Parece que o banco ainda não foi criado. Rode <code>npm run setup</code> no
          terminal e tente de novo.
        </p>
      )}

      <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-50 p-3 text-left text-xs text-[var(--color-ink-soft)]">
        {error.message}
      </pre>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          <RotateCcw className="h-4 w-4" />
          Tentar de novo
        </button>
        <Link href="/dashboard" className="btn-secondary">
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
