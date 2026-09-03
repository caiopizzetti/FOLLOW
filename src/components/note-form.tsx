"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";

import { addNoteAction } from "@/app/actions";

/**
 * Registro manual no histórico: uma anotação interna ou uma resposta que o
 * cliente mandou por fora (que também conta como interação).
 */
export function NoteForm({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState(addNoteAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="leadId" value={leadId} />

      <textarea
        name="message"
        rows={2}
        required
        placeholder="Ex.: cliente pediu para retomar em setembro"
        className="field resize-y"
        aria-label="Registro no histórico"
      />

      <div className="flex flex-wrap items-center gap-3">
        <select name="kind" defaultValue="NOTE" className="field w-auto py-1.5 text-sm" aria-label="Tipo do registro">
          <option value="NOTE">Anotação interna</option>
          <option value="RESPONSE">Cliente respondeu</option>
        </select>

        <button type="submit" disabled={pending} className="btn-secondary">
          <Plus className="h-4 w-4" />
          {pending ? "Salvando…" : "Adicionar ao histórico"}
        </button>

        {state && (
          <span className={`text-xs ${state.ok ? "text-emerald-600" : "text-red-600"}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
