import { analyseLead } from "../stale";
import type { Lead, LeadInsight } from "../types";
import type { FollowUpProvider, FollowUpSuggestion } from "./provider";
import { ruleBasedProvider } from "./rules";

export type { FollowUpProvider, FollowUpSuggestion };

/**
 * Provider ativo. Trocar por um provider de IA no futuro e uma linha aqui.
 * Nenhum componente de UI importa `rules.ts` diretamente.
 */
const activeProvider: FollowUpProvider = ruleBasedProvider;

function isInsight(input: Lead | LeadInsight): input is LeadInsight {
  return "lead" in input;
}

/**
 * Ponto unico de geracao de mensagem de follow-up do produto.
 *
 * Aceita um Lead cru (calcula o contexto na hora) ou um LeadInsight ja
 * analisado, para nao repetir trabalho nas telas.
 */
export function generateFollowUpMessage(
  input: Lead | LeadInsight,
  now: Date = new Date(),
): FollowUpSuggestion {
  const insight = isInsight(input) ? input : analyseLead(input, now);
  return activeProvider.generate(insight);
}
