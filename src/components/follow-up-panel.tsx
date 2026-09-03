"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Copy, Pencil, RotateCcw, Send } from "lucide-react";

import { markAsContactedAction } from "@/app/actions";

interface FollowUpPanelProps {
  leadId: string;
  suggestion: string;
  rationale: string;
  /** Se false, o lead está fechado (ganho/perdido) e a ação é opcional. */
  needsAction: boolean;
}

/**
 * "PRÓXIMA AÇÃO" — mensagem sugerida + copiar + marcar como contatado.
 *
 * É o único componente com estado do produto: precisa de clipboard, edição
 * inline e confirmação visual imediata.
 */
export function FollowUpPanel({
  leadId,
  suggestion,
  rationale,
  needsAction,
}: FollowUpPanelProps) {
  const [message, setMessage] = useState(suggestion);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
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

  if (done) {
    return (
      <section className="card border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600">
            <Check className="h-4.5 w-4.5 text-white" strokeWidth={3} />
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
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

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
            onClick={handleMarkContacted}
            disabled={pending}
            className="btn-primary ml-auto"
          >
            <Send className="h-4 w-4" />
            {pending ? "Registrando…" : "Marcar como contatado"}
          </button>
        </div>

        {!needsAction && (
          <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
            Esta oportunidade não está atrasada. Você ainda pode registrar um contato.
          </p>
        )}
      </div>
    </section>
  );
}
