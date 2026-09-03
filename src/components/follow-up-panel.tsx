"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Copy, Pencil, RotateCcw, Send, Tag } from "lucide-react";

import { markAsContactedAction, updateStatusAction } from "@/app/actions";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/lib/domain/types";

interface FollowUpPanelProps {
  leadId: string;
  status: LeadStatus;
  suggestion: string;
  rationale: string;
  /** Se false, o lead está fechado (ganho/perdido) e a ação é opcional. */
  needsAction: boolean;
}

/**
 * "PRÓXIMA AÇÃO" — mensagem sugerida e as três ações do produto:
 * copiar, marcar como contatado e alterar status.
 *
 * É o único componente com estado real: precisa de clipboard, edição inline
 * e confirmação visual imediata.
 */
export function FollowUpPanel({
  leadId,
  status,
  suggestion,
  rationale,
  needsAction,
}: FollowUpPanelProps) {
  const [message, setMessage] = useState(suggestion);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // A sugestão muda quando o lead muda de status — reflete no editor.
  useEffect(() => {
    setMessage(suggestion);
  }, [suggestion]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!statusNote) return;
    const timer = setTimeout(() => setStatusNote(null), 2600);
    return () => clearTimeout(timer);
  }, [statusNote]);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  /**
   * navigator.clipboard só existe em contexto seguro (https ou localhost).
   * Em rede local via http o fallback abaixo mantém o botão funcionando.
   */
  async function handleCopy() {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        return;
      } catch {
        // cai no fallback
      }
    }

    const scratch = document.createElement("textarea");
    scratch.value = message;
    scratch.setAttribute("readonly", "");
    scratch.style.position = "fixed";
    scratch.style.top = "-1000px";
    document.body.appendChild(scratch);
    scratch.select();

    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(scratch);

    if (ok) {
      setCopied(true);
    } else {
      setError("Não foi possível copiar automaticamente. Selecione o texto e copie à mão.");
    }
  }

  function handleMarkContacted() {
    setError(null);
    startTransition(async () => {
      const result = await markAsContactedAction(leadId, message);
      if (result.ok) {
        setDone(true);
      } else {
        setError(result.message ?? "Não foi possível registrar o follow-up.");
      }
    });
  }

  function handleStatusChange(next: LeadStatus) {
    if (next === status) {
      setStatusOpen(false);
      return;
    }
    setError(null);
    const form = new FormData();
    form.set("leadId", leadId);
    form.set("status", next);

    startStatusTransition(async () => {
      const result = await updateStatusAction(null, form);
      if (result.ok) {
        setStatusOpen(false);
        setStatusNote(`Status alterado para ${STATUS_LABELS[next]}.`);
      } else {
        setError(result.message ?? "Não foi possível alterar o status.");
      }
    });
  }

  if (done) {
    return (
      <section id="follow-up" className="card border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600">
            <Check className="h-5 w-5 text-white" strokeWidth={3} />
          </span>
          <div>
            <p className="font-semibold text-emerald-900">Follow-up registrado.</p>
            <p className="mt-1 text-sm text-emerald-800">
              O contador de dias parados foi zerado, o histórico foi atualizado e esta
              oportunidade saiu da fila de alertas.
            </p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="btn-secondary mt-4 border-emerald-300 bg-white/70 text-emerald-900 hover:bg-white"
            >
              <RotateCcw className="h-4 w-4" />
              Registrar outro contato
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="follow-up" className="card overflow-hidden">
      <header className="border-b border-[var(--color-line)] px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
          Próxima ação
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{rationale}</p>
      </header>

      <div className="p-6">
        {editing ? (
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={7}
            className="field resize-y leading-relaxed"
            aria-label="Mensagem de follow-up"
          />
        ) : (
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message}</p>
          </div>
        )}

        <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
          Mensagem gerada por regras do próprio sistema — nenhuma IA envolvida. Copie, envie
          pelo canal que preferir e volte para registrar.
        </p>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {statusNote && (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {statusNote}
          </p>
        )}

        {/* ------------------------------------------------- as três ações */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={handleCopy} className="btn-secondary">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                Copiada!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar mensagem
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="btn-secondary"
          >
            <Pencil className="h-4 w-4" />
            {editing ? "Concluir edição" : "Editar"}
          </button>

          <button
            type="button"
            onClick={() => setStatusOpen((open) => !open)}
            aria-expanded={statusOpen}
            className="btn-secondary"
          >
            <Tag className="h-4 w-4" />
            Alterar status
          </button>

          <button
            type="button"
            onClick={handleMarkContacted}
            disabled={pending}
            className="btn-primary sm:ml-auto"
          >
            <Send className="h-4 w-4" />
            {pending ? "Registrando…" : "Marcar como contatado"}
          </button>
        </div>

        {statusOpen && (
          <div className="mt-4 rounded-lg border border-[var(--color-line)] bg-gray-50 p-4">
            <p className="mb-3 text-sm font-medium">Alterar status para:</p>
            <div className="flex flex-wrap gap-2">
              {LEAD_STATUSES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleStatusChange(option)}
                  disabled={statusPending || option === status}
                  className={`chip border transition-colors ${
                    option === status
                      ? "cursor-default border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                      : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:bg-white/60 hover:text-[var(--color-ink)] disabled:opacity-50"
                  }`}
                >
                  {STATUS_LABELS[option]}
                  {option === status && " (atual)"}
                </button>
              ))}
            </div>
            {statusPending && (
              <p className="mt-3 text-xs text-[var(--color-ink-faint)]">salvando…</p>
            )}
          </div>
        )}

        {!needsAction && (
          <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
            Esta oportunidade não está atrasada. Você ainda pode registrar um contato.
          </p>
        )}
      </div>
    </section>
  );
}
