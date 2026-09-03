import type { LeadInsight } from "../types";

/**
 * Contrato de geracao de mensagem de follow-up.
 *
 * Hoje existe uma unica implementacao, baseada em regras (rules.ts).
 * Quando quisermos IA, basta escrever um `AiFollowUpProvider` que implemente
 * esta interface e trocar a escolha em index.ts — nenhuma tela muda.
 */
export interface FollowUpProvider {
  readonly id: string;
  generate(insight: LeadInsight): FollowUpSuggestion;
}

export interface FollowUpSuggestion {
  /** Texto pronto para o vendedor copiar. */
  message: string;
  /** De onde veio a sugestao — util para debug e para a UI ser honesta. */
  providerId: string;
  /** Qual regra/gatilho gerou a mensagem. */
  rationale: string;
}
