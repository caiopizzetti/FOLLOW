/**
 * Configuracao central do produto.
 *
 * TODO o comportamento de "lead parado" e cadencia de follow-up e definido
 * aqui. Para mudar as regras de negocio, mude este arquivo — nao espalhe
 * numeros magicos pelas telas.
 */

export const followUpConfig = {
  /**
   * Dias sem interacao a partir dos quais um lead entra em cada nivel.
   * A leitura e: >= critico  -> CRITICO
   *              >= atencao  -> ATENCAO
   *              caso contrario -> NORMAL
   */
  thresholds: {
    /** 7+ dias sem interacao. */
    critical: 7,
    /** 3 a 6 dias sem interacao. */
    warning: 3,
  },

  /**
   * Quando o vendedor marca um lead como contatado, agendamos o proximo
   * follow-up para daqui a N dias.
   */
  nextFollowUpInDays: 3,

  /**
   * Se true, leads NOVO que nunca foram contatados tambem entram na fila de
   * acao (usando createdAt como referencia).
   *
   * A especificacao original pedia "possui algum contato anterior ou
   * orcamento". Mantivemos o flag ligado porque um lead que entrou e nunca
   * recebeu retorno e exatamente a oportunidade mais esquecida que o produto
   * existe para resgatar. Desligue aqui se quiser o comportamento estrito.
   */
  includeNeverContacted: true,

  /** Fuso usado para calcular "dias parados" e formatar datas. */
  timeZone: "America/Sao_Paulo",

  /** Moeda usada na formatacao de valores. */
  currency: "BRL",
  locale: "pt-BR",
} as const;

export type FollowUpConfig = typeof followUpConfig;
