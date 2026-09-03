"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addNote,
  createLead,
  markAsContacted,
  registerResponse,
  updateStatus,
} from "@/lib/db/queries";
import { isLeadStatus, type LeadStatus } from "@/lib/domain/types";

/**
 * Server Actions — a única porta de escrita da aplicação.
 * Cada ação revalida as rotas afetadas para que os números do painel e a fila
 * de ação reflitam a mudança imediatamente.
 */

export interface ActionResult {
  ok: boolean;
  message?: string;
}

function revalidateAll(leadId?: string): void {
  revalidatePath("/dashboard");
  revalidatePath("/leads");
  if (leadId) revalidatePath(`/leads/${leadId}`);
}

/** Parse tolerante de valor: aceita "4500", "4.500,00" e "R$ 4.500". */
function parseCurrencyInput(raw: FormDataEntryValue | null): number {
  if (typeof raw !== "string") return 0;
  const cleaned = raw.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;

  // Se tem vírgula, assumimos formato pt-BR: pontos são milhar, vírgula é decimal.
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;

  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/* ---------------------------------------------------------------- cadastro */

export async function createLeadAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const name = text(form, "name");
  if (!name) {
    return { ok: false, message: "Informe o nome do contato." };
  }

  const statusRaw = form.get("status");
  const status: LeadStatus = isLeadStatus(statusRaw) ? statusRaw : "NOVO";

  let leadId: string;
  try {
    const lead = await createLead({
      name,
      phone: text(form, "phone"),
      email: text(form, "email"),
      company: text(form, "company"),
      value: parseCurrencyInput(form.get("value")),
      status,
      source: text(form, "source"),
      notes: text(form, "notes"),
    });
    leadId = lead.id;
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível salvar.",
    };
  }

  revalidateAll(leadId);
  // redirect() lança internamente — precisa ficar fora do try/catch.
  redirect(`/leads/${leadId}?criado=1`);
}

/* --------------------------------------------------------------- follow-up */

export async function markAsContactedAction(
  leadId: string,
  message?: string,
): Promise<ActionResult> {
  try {
    await markAsContacted(leadId, message);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível registrar.",
    };
  }
  revalidateAll(leadId);
  return { ok: true, message: "Follow-up registrado." };
}

/* ------------------------------------------------------------------ status */

export async function updateStatusAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const leadId = text(form, "leadId");
  const statusRaw = form.get("status");

  if (!leadId || !isLeadStatus(statusRaw)) {
    return { ok: false, message: "Status inválido." };
  }

  try {
    await updateStatus(leadId, statusRaw);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível atualizar.",
    };
  }
  revalidateAll(leadId);
  return { ok: true, message: "Status atualizado." };
}

/* ---------------------------------------------------------------- anotação */

export async function addNoteAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const leadId = text(form, "leadId");
  const message = text(form, "message");
  const kind = text(form, "kind");

  if (!leadId || !message) {
    return { ok: false, message: "Escreva algo antes de salvar." };
  }

  try {
    if (kind === "RESPONSE") {
      await registerResponse(leadId, message);
    } else {
      await addNote(leadId, message);
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível salvar.",
    };
  }
  revalidateAll(leadId);
  return { ok: true, message: "Registrado no histórico." };
}
