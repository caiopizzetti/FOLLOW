import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NewLeadForm } from "@/components/new-lead-form";
import { followUpConfig } from "@/lib/config";

export const metadata = { title: "Nova oportunidade — FOLLOW" };

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para oportunidades
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova oportunidade</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Só o nome é obrigatório. A partir do cadastro, o sistema começa a contar os dias sem
          interação e avisa depois de {followUpConfig.thresholds.warning} dias.
        </p>
      </div>

      <NewLeadForm />
    </div>
  );
}
