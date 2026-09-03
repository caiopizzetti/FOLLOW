"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";

import { createLeadAction } from "@/app/actions";
import { LEAD_STATUSES, STATUS_LABELS } from "@/lib/domain/types";

const SOURCES = ["WhatsApp", "Site", "Indicação", "Instagram", "Telefone", "Evento", "Outro"];

export function NewLeadForm() {
  const [state, formAction, pending] = useActionState(createLeadAction, null);

  return (
    <form action={formAction} className="card divide-y divide-[var(--color-line)]">
      <div className="grid gap-5 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="field-label">
            Nome do contato <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            autoFocus
            autoComplete="off"
            placeholder="Ex.: Mariana Alves"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="phone" className="field-label">
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            inputMode="tel"
            autoComplete="off"
            placeholder="(11) 90000-0000"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="contato@empresa.com.br"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="company" className="field-label">
            Empresa
          </label>
          <input
            id="company"
            name="company"
            autoComplete="off"
            placeholder="Ex.: Padaria Sol Nascente"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="value" className="field-label">
            Valor da oportunidade
          </label>
          <input
            id="value"
            name="value"
            inputMode="decimal"
            autoComplete="off"
            placeholder="4.500,00"
            className="field"
          />
          <p className="mt-1.5 text-xs text-[var(--color-ink-faint)]">
            Em reais. Aceita 4500 ou 4.500,00.
          </p>
        </div>

        <div>
          <label htmlFor="source" className="field-label">
            Origem
          </label>
          <select id="source" name="source" defaultValue="" className="field">
            <option value="">Selecione…</option>
            {SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <select id="status" name="status" defaultValue="NOVO" className="field">
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="field-label">
            Observações
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="O que o cliente pediu, contexto da conversa, prazos…"
            className="field resize-y"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-6 py-4">
        <button type="submit" disabled={pending} className="btn-primary">
          <Plus className="h-4 w-4" />
          {pending ? "Salvando…" : "Adicionar oportunidade"}
        </button>

        {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      </div>
    </form>
  );
}
