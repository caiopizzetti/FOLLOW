import { DatabaseZap } from "lucide-react";

/**
 * Tela mostrada quando a aplicação está no ar mas sem banco configurado.
 * É o erro mais provável no primeiro deploy, então ele explica o conserto
 * em vez de mostrar uma falha genérica.
 */
export function ConfigNotice({ problem }: { problem: string }) {
  return (
    <div className="card mx-auto max-w-xl p-10 text-center">
      <DatabaseZap className="mx-auto h-8 w-8 text-amber-500" />
      <h1 className="mt-4 text-lg font-semibold">Banco de dados não configurado</h1>
      <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">{problem}</p>

      <div className="mt-5 rounded-lg bg-gray-50 p-4 text-left text-sm text-[var(--color-ink-soft)]">
        <p className="font-medium text-[var(--color-ink)]">Para resolver:</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5">
          <li>
            Crie um banco no Turso e copie a URL e o token.
          </li>
          <li>
            No painel do projeto na Vercel, em{" "}
            <span className="font-medium">Settings → Environment Variables</span>, defina{" "}
            <code>TURSO_DATABASE_URL</code> e <code>TURSO_AUTH_TOKEN</code>.
          </li>
          <li>Rode um novo deploy para as variáveis entrarem em vigor.</li>
        </ol>
        <p className="mt-3 text-xs">
          O passo a passo completo está no README, na seção de deploy.
        </p>
      </div>
    </div>
  );
}
