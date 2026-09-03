"use client";

import { useActionState, useEffect, useRef } from "react";

import { updateStatusAction } from "@/app/actions";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/lib/domain/types";

/**
 * Troca de status. Submete no onChange para o vendedor não precisar clicar em
 * "salvar" — a mudança de status é sempre intencional.
 */
export function StatusControl({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [state, formAction, pending] = useActionState(updateStatusAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Mantém o select alinhado com o servidor caso a ação falhe.
    if (state && !state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="leadId" value={leadId} />
      <select
        name="status"
        defaultValue={status}
        disabled={pending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        aria-label="Status da oportunidade"
        className="field w-auto py-1.5 pr-8 text-sm"
      >
        {LEAD_STATUSES.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      {pending && <span className="text-xs text-[var(--color-ink-faint)]">salvando…</span>}
      {state && !state.ok && <span className="text-xs text-red-600">{state.message}</span>}
    </form>
  );
}
