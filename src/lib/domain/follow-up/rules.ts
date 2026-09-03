import { formatCurrency } from "../../format";
import type { LeadInsight } from "../types";
import type { FollowUpProvider, FollowUpSuggestion } from "./provider";

/** Primeiro nome, para a mensagem soar pessoal sem parecer template. */
function firstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? fullName;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/**
 * Geracao por regras — sem IA, sem API paga, 100% deterministica.
 * Cada status tem um gancho diferente porque a conversa esta em um ponto
 * diferente.
 */
export const ruleBasedProvider: FollowUpProvider = {
  id: "rules-v1",

  generate(insight: LeadInsight): FollowUpSuggestion {
    const { lead, daysStalled } = insight;
    const nome = firstName(lead.name);
    const valor = formatCurrency(lead.value);

    switch (lead.status) {
      case "ORCAMENTO":
        return {
          providerId: this.id,
          rationale: `Orçamento de ${valor} enviado e sem retorno há ${daysStalled} dias.`,
          message:
            `Oi, ${nome}! Tudo certo?\n\n` +
            `Passando para saber se conseguiu avaliar o orçamento de ${valor} que te enviei. ` +
            `Se quiser, posso tirar qualquer dúvida sobre o projeto.`,
        };

      case "NEGOCIACAO":
        return {
          providerId: this.id,
          rationale: `Negociação parada há ${daysStalled} dias.`,
          message:
            `Oi, ${nome}! Tudo bem?\n\n` +
            `Queria saber se ficou alguma dúvida sobre a proposta. ` +
            `Se fizer sentido, consigo ajustar o escopo ou as condições para fechar.`,
        };

      case "NOVO":
        return {
          providerId: this.id,
          rationale: lead.lastContactAt
            ? `Lead novo sem avanço há ${daysStalled} dias.`
            : `Lead entrou há ${daysStalled} dias e nunca foi contatado.`,
          message:
            `Oi, ${nome}! Tudo certo?\n\n` +
            `Vi que você entrou em contato${lead.source ? ` via ${lead.source}` : ""} e ainda não conseguimos conversar. ` +
            `Me conta rapidamente o que você precisa que eu te mando uma proposta.`,
        };

      case "CONTATO":
        return {
          providerId: this.id,
          rationale: `Conversa iniciada e parada há ${daysStalled} dias.`,
          message:
            `Oi, ${nome}! Tudo bem?\n\n` +
            `Falamos por aqui alguns dias atrás e não consegui te retornar com tudo. ` +
            `Quer que eu prepare um orçamento com o que conversamos?`,
        };

      case "GANHO":
        return {
          providerId: this.id,
          rationale: "Oportunidade já ganha — mensagem de acompanhamento.",
          message:
            `Oi, ${nome}! Tudo certo?\n\n` +
            `Só passando para saber como está indo tudo depois do fechamento. ` +
            `Qualquer coisa, é só me chamar.`,
        };

      case "PERDIDO":
        return {
          providerId: this.id,
          rationale: "Oportunidade perdida — tentativa de reabertura.",
          message:
            `Oi, ${nome}! Tudo bem?\n\n` +
            `Faz um tempo que conversamos e não seguimos na época. ` +
            `Mudou alguma coisa por aí? Se quiser, posso rever a proposta.`,
        };
    }
  },
};
