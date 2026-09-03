import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md p-12 text-center">
      <SearchX className="mx-auto h-8 w-8 text-[var(--color-ink-faint)]" />
      <h1 className="mt-4 text-lg font-semibold">Não encontramos essa página</h1>
      <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
        A oportunidade pode ter sido removida ou o endereço está errado.
      </p>
      <Link href="/dashboard" className="btn-primary mt-6">
        Voltar para o painel
      </Link>
    </div>
  );
}
