# O que o MVP faz

Documento de escopo: descreve exatamente o que existe e funciona hoje.
Para o que ficou de fora, veja [`proximos-passos.md`](proximos-passos.md).

---

## A hipótese que estamos testando

> Empresas perdem vendas porque leads e orçamentos ficam esquecidos sem
> follow-up.

O produto tem que provar uma coisa só:

> **Consigo olhar para uma tela e descobrir rapidamente quais oportunidades
> estão sendo esquecidas?**

Toda funcionalidade abaixo existe para responder isso. O que não ajudava a
responder não foi construído.

---

## O fluxo principal

```
ABRIR  →  VER O QUE ESTÁ PARADO  →  CLICAR  →  AGIR  →  RESOLVIDO
```

1. O usuário abre `/dashboard`
2. Lê *"12 oportunidades precisam de ação"* e *"R$ 111.000 parados"*
3. Clica no lead mais urgente da fila
4. Vê valor, tempo parado, histórico, **motivo do alerta** e mensagem sugerida
5. Clica em **Copiar mensagem**
6. Faz o contato por fora (WhatsApp, telefone, e-mail — o que preferir)
7. Volta e clica em **Marcar como contatado**
8. O sistema registra no histórico, zera os dias parados e tira o lead da fila

Esse fluxo está **100% funcional e testado ponta a ponta**.

---

## Telas

### `/dashboard` — o que está parado

Bloco principal, com quatro números:

| Card | O que responde |
| --- | --- |
| Precisam de ação | Quantos leads estão parados além do prazo |
| Em oportunidades paradas | Quanto dinheiro está travado |
| Sem follow-up há 7+ dias | Quantos estão em nível crítico |
| Em oportunidades críticas | Quanto dinheiro há nos críticos |

Abaixo, a **fila de ação**: cada linha mostra nome, empresa, o motivo em
linguagem humana, valor, dias parado, prioridade e o botão *Fazer follow-up*.

Rodapé com o resumo da base: oportunidades ativas, follow-ups para hoje e
oportunidades recuperadas.

> **"Recuperadas"** conta apenas leads **GANHO** que receberam ao menos um
> follow-up registrado na ferramenta antes de fechar. É um número derivado do
> banco, não uma estimativa inventada.

### `/leads` — a lista completa

Colunas: Nome · Empresa · Valor · Status · Último contato · Dias parado ·
Prioridade · Ação.

Filtros (cada um com contagem): **Todos**, **Precisam de ação**, **Críticos**,
**Hoje**, **Ganhos**, **Perdidos**.

Ordenação padrão, sempre:

1. quem precisa de ação primeiro
2. críticos antes de atenção
3. maior valor
4. mais tempo parado

### `/leads/[id]` — o lead

- **Cabeçalho:** nome, empresa, valor, status, prioridade, dias parado
- **Motivo do alerta:** *"Por que apareceu aqui: Negociação parada há 11 dias."*
- **Dados:** telefone, e-mail, origem, criado em, último contato, próximo follow-up
- **Observações**
- **Próxima ação:** mensagem sugerida + `Copiar mensagem` · `Editar` · `Marcar como contatado`
- **Histórico:** linha do tempo dos eventos, terminando no alerta ⚠️ quando aplicável
- **Adicionar ao histórico:** anotação interna ou "cliente respondeu"

O seletor de status salva sozinho ao mudar e registra a alteração no histórico.

### `/leads/new` — cadastro

Nome (obrigatório), telefone, e-mail, empresa, valor, origem, status e
observações. O campo de valor aceita `4500`, `4.500,00` ou `R$ 4.500`.

Depois de salvar, o lead aparece na hora na lista e nas contas do painel.

---

## A regra de "lead parado"

Determinística, transparente e **sem IA**. Definida em
`src/lib/domain/stale.ts`, com os limites em `src/lib/config.ts`.

Um lead precisa de follow-up quando **todas** as condições valem:

1. não está `GANHO`
2. não está `PERDIDO`
3. já teve contato/orçamento **ou** é um lead novo nunca contatado
4. passou de `warning` dias sem interação (padrão: 3)

### Níveis

| Nível | Dias sem interação |
| --- | --- |
| 🔴 **CRÍTICO** | 7 ou mais |
| 🟡 **ATENÇÃO** | 3 a 6 |
| ⚪ **NORMAL** | 0 a 2 |

### Como os dias são contados

Referência = `lastContactAt`; se nunca houve contato, `createdAt`.

A contagem é em **dias de calendário** no fuso `America/Sao_Paulo`, não em
janelas de 24 horas — é assim que o vendedor pensa ("faz três dias que falei
com ele"). Todo o cálculo acontece no servidor, então a tela nunca faz conta de
data e não há divergência entre servidor e navegador.

### Sobre a condição 3

A especificação original pedia *"possui algum contato anterior ou orçamento"*.
Mantivemos ligado o flag `includeNeverContacted`, que **também** sinaliza leads
novos que nunca receberam retorno — é justamente a oportunidade mais esquecida
que o produto existe para resgatar. Para o comportamento estrito, basta mudar
`includeNeverContacted: false` em `src/lib/config.ts`.

### A plataforma sempre explica

Nenhum alerta aparece sem justificativa. Exemplos de frases geradas:

- *"Orçamento enviado e sem resposta há 8 dias."*
- *"Negociação parada há 11 dias."*
- *"Entrou há 9 dias e nunca foi contatado."*
- *"Sem interação há 4 dias."*
- *"Interação registrada hoje."*
- *"Oportunidade ganha — nenhuma ação necessária."*

---

## Mensagens de follow-up

Geradas por regras, uma por status, em
`src/lib/domain/follow-up/rules.ts`. Ponto único de entrada:
`generateFollowUpMessage(lead)`.

| Status | Gancho da mensagem |
| --- | --- |
| `ORCAMENTO` | "Conseguiu avaliar o orçamento de R$ X que te enviei?" |
| `NEGOCIACAO` | "Ficou alguma dúvida sobre a proposta?" |
| `NOVO` | "Vi que você entrou em contato e ainda não conseguimos conversar." |
| `CONTATO` | "Quer que eu prepare um orçamento com o que conversamos?" |
| `GANHO` | Acompanhamento pós-fechamento |
| `PERDIDO` | Tentativa de reabertura |

A mensagem usa o primeiro nome e o valor formatado em reais. É editável antes de
enviar, e o texto final fica registrado no histórico.

**Nenhuma IA e nenhuma API paga.** A interface `FollowUpProvider` já existe para
que trocar por um modelo seja uma linha de código.

---

## O que "Marcar como contatado" faz

Exatamente cinco coisas:

1. atualiza `lastContactAt` para agora
2. agenda `nextFollowUpAt` para daqui a 3 dias (`nextFollowUpInDays`)
3. cria um evento `FOLLOW_UP` no histórico com a mensagem enviada
4. recalcula os dias parados (vão a zero) e remove o lead da fila de alertas
5. mostra a confirmação verde *"Follow-up registrado."*

Se o lead estava em `NOVO`, ele passa automaticamente para `CONTATO` — porque,
na prática, o contato aconteceu.

---

## Modelo de dados

Duas tabelas (`src/lib/db/schema.sql`).

**`leads`** — id, name, phone, email, company, value, status, source,
created_at, last_contact_at, next_follow_up_at, notes

Status: `NOVO` · `CONTATO` · `ORCAMENTO` · `NEGOCIACAO` · `GANHO` · `PERDIDO`

**`history`** — id, lead_id, type, message, created_at

Tipos: `CONTACT` · `FOLLOW_UP` · `RESPONSE` · `STATUS_CHANGE` · `NOTE`

Os status e tipos são validados por `CHECK` no banco **e** por tipos do
TypeScript.

---

## Dados de demonstração

18 leads fictícios em `scripts/seed-data.mjs`, distribuídos de propósito:

| Grupo | Quantidade |
| --- | --- |
| Críticos (7+ dias) | 8 |
| Em atenção (3–6 dias) | 4 |
| Dentro do prazo | 2 |
| Ganhos | 2 (um deles recuperado via follow-up) |
| Perdidos | 2 |

Valores de R$ 1.600 a R$ 24.000, para que o ordenamento por valor seja visível.
Cobre todos os status, todos os filtros, todos os níveis de prioridade e um caso
de "oportunidade recuperada".

> **Tudo é inventado.** E-mails no domínio reservado `.test`, telefones no padrão
> `(XX) 90000-00XX`, empresas com "(fictícia)" no nome. O aviso está no topo do
> arquivo do seed e no rodapé de todas as telas.

As datas são relativas ao dia da execução, então a demonstração nunca "envelhece".

---

## O que foi verificado

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | sem erros nem avisos |
| `npm run typecheck` | sem erros |
| `npm run build` | build de produção limpo |
| Fluxo painel → lead → copiar → marcar → sai da fila | funciona |
| Recálculo de dias parados e sumiço do alerta | funciona |
| Cadastro de lead (valor em pt-BR) e aparição imediata | funciona |
| Mudança de status + registro no histórico | funciona |
| Os 6 filtros e a ordenação | funcionam |
| Copiar para a área de transferência | funciona (com fallback sem HTTPS) |
| Responsividade a 390px (sem rolagem horizontal) | funciona |
| Lead inexistente devolve 404 | funciona |

| Sidebar com os 3 destinos e item ativo correto | funciona |
| Estados de loading, vazio, erro e sucesso | existem em todas as rotas |
| Lead inexistente devolve 404 (status, não só a tela) | funciona |
| Persistência após reload **e** após restart do servidor | funciona |

Verificado com um roteiro automatizado no Chromium (79 asserções), rodado tanto
em `npm run dev` quanto em `npm start`.
