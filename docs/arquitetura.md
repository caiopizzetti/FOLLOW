# Arquitetura e decisões técnicas

Cada decisão abaixo vem com o motivo e o que abrimos mão ao escolher.

---

## Princípio que guiou tudo

> É um MVP para testar uma hipótese comercial, não uma plataforma para escalar.

Então: menos dependências, menos camadas, menos configuração. Toda a lógica de
produto precisa ser legível por alguém que abriu o repositório há dez minutos.

---

## Stack

| Camada | Escolha | Motivo |
| --- | --- | --- |
| Framework | **Next.js 15** (App Router) | Server Components + Server Actions dão um app com banco sem escrever nenhuma rota de API |
| Linguagem | **TypeScript** (strict) | Status e tipos de histórico viram união de literais, não strings soltas |
| Estilo | **Tailwind CSS v4** | Configuração em CSS, sem `tailwind.config.js` |
| Banco | **SQLite via `node:sqlite`** | Embutido no Node 22+ — ver abaixo |
| Ícones | **lucide-react** | Pedido explicitamente; leve e tree-shakeable |

**Total de dependências de produção: 4** (`next`, `react`, `react-dom`,
`lucide-react`).

---

## Decisão 1 — `node:sqlite` no lugar de Prisma ou Drizzle

**Contexto:** foram sugeridos Prisma ou Drizzle. O schema tem duas tabelas e
nenhum relacionamento além de uma chave estrangeira.

**O que foi escolhido:** o módulo `node:sqlite`, embutido no Node 22.5+, com SQL
escrito à mão numa camada de repositório (`src/lib/db/queries.ts`).

**Por quê:**

- **Zero instalação extra.** Prisma baixa um query engine em tempo de
  instalação e precisa de `prisma generate`. `better-sqlite3` é módulo nativo e
  precisa de binário pré-compilado ou de toolchain de C++. `node:sqlite` já vem
  no Node — `npm install` e pronto, em qualquer máquina, sem rede.
- **Sem etapa de codegen.** Nada de "esqueci de rodar generate depois do pull".
- **O schema não justifica um ORM.** São duas tabelas. Toda a camada de dados —
  SQL, conversão de tipos e métricas do painel — cabe em um arquivo de ~300
  linhas, mais fácil de auditar do que a configuração equivalente de um ORM.
- **Menos superfície para quebrar** num projeto cuja graça é rodar de primeira.

**O que abrimos mão:**

- Sem migrações versionadas. O schema é aplicado de forma idempotente
  (`CREATE TABLE IF NOT EXISTS`) a cada conexão. Serve para um MVP; um produto
  em produção precisa de migrações de verdade.
- Sem tipos gerados a partir do schema. As linhas do banco são convertidas à mão
  para os tipos do domínio (`toLead`, `toHistoryEntry`), o que é um ponto de
  atenção se as colunas mudarem.
- `node:sqlite` é marcado como experimental no Node 22 e imprime um aviso na
  saída. A API que usamos (`DatabaseSync`, `prepare`, `run`, `get`, `all`) é
  pequena e estável.

**Se um dia precisar trocar:** todo o SQL está em `src/lib/db/queries.ts`. As
telas só chamam funções tipadas (`listInsights`, `getDashboardMetrics`, …).
Trocar o motor é reescrever esse arquivo, sem tocar em nenhum componente.

---

## Decisão 2 — Server Actions no lugar de rotas de API

Toda escrita passa por `src/app/actions.ts`, marcado com `"use server"`. Não
existe `/api/*`.

**Por quê:** um formulário chama a função direto, sem `fetch`, sem serialização
manual, sem estado de carregamento escrito à mão. Depois de cada escrita,
`revalidatePath()` atualiza painel, lista e detalhe de uma vez — é por isso que
o contador do painel cai no mesmo instante em que você marca um lead como
contatado.

**O que abrimos mão:** não há API pública para integrações externas. Foi
proposital: integração não faz parte do MVP.

---

## Decisão 3 — todo cálculo de data no servidor

Nenhum componente calcula dias. O servidor produz um `LeadInsight` já pronto:

```ts
interface LeadInsight {
  lead: Lead;
  referenceAt: string;
  daysStalled: number;      // já calculado
  priority: Priority;       // já classificado
  needsAction: boolean;     // já decidido
  reason: string;           // já escrito em português
  dueToday: boolean;
}
```

**Por quê:**

1. **Sem divergência de hidratação.** Se o servidor renderizasse "8 dias" e o
   navegador recalculasse em outro fuso, o React acusaria erro.
2. **Uma fonte de verdade.** Painel, lista e detalhe usam a mesma função
   (`analyseLead`), então os três nunca discordam.
3. **Testável.** `analyseLead(lead, now)` recebe o instante como parâmetro, então
   dá para testar qualquer cenário de data sem mexer no relógio da máquina.

Dias são contados em **dias de calendário** no fuso `America/Sao_Paulo`, não em
janelas de 24h — é o modelo mental do vendedor ("faz três dias que falei com
ele"), não o do relógio.

---

## Decisão 4 — configuração centralizada

Todos os limites do produto vivem em `src/lib/config.ts`. Nenhum prazo aparece
escrito em componente nenhum: o painel lê `followUpConfig.thresholds.critical`
para escrever *"Sem follow-up há 7+ dias"*, e a tela de cadastro lê
`warning` para dizer depois de quantos dias o alerta aparece.

Mudar `critical: 7` para `critical: 10` reclassifica prioridades, muda as
contagens, muda os filtros e muda os textos — tudo junto, sem mais nenhuma
edição.

---

## Decisão 5 — IA atrás de uma interface, não dentro do código

A geração de mensagem é um **provider**:

```ts
export interface FollowUpProvider {
  readonly id: string;
  generate(insight: LeadInsight): FollowUpSuggestion;
}
```

Hoje existe uma implementação: `ruleBasedProvider` (determinística, sem rede,
sem custo). O resto do sistema só conhece `generateFollowUpMessage(lead)`.

**Para plugar IA depois:** escreva um `aiFollowUpProvider` que implemente a
interface e troque uma linha em `src/lib/domain/follow-up/index.ts`. Nenhum
componente muda.

`FollowUpSuggestion` já carrega `providerId` e `rationale`, então a interface
sempre pode ser honesta sobre de onde veio a sugestão.

---

## Decisão 6 — fonte do sistema, sem `next/font`

`next/font/google` baixa arquivos de fonte durante o build. Isso quebra build
offline ou atrás de proxy corporativo, e o benefício visual num app B2B interno
é pequeno.

Usamos a pilha de fontes do sistema (`-apple-system`, `Segoe UI`, `Roboto`, …):
carrega instantâneo, não depende de rede e já parece nativa em cada SO.

---

## Decisão 7 — route group `(list)` para não quebrar o 404

`/leads/[id]` chama `notFound()` quando o lead não existe. Um `loading.tsx`
em `src/app/leads/` criaria um boundary de Suspense em volta de **toda** a
subárvore — inclusive `[id]` — e o Next passa a enviar o shell da resposta
antes de o componente rodar. Resultado: a página 404 aparece na tela, mas o
status HTTP volta 200.

Isso foi encontrado em teste (o status caiu de 404 para 200 ao adicionar os
estados de carregamento) e resolvido movendo a lista para um route group:

```
src/app/leads/
├── error.tsx           # boundary de erro de toda a subárvore
├── (list)/             # não aparece na URL
│   ├── page.tsx        # /leads
│   └── loading.tsx     # skeleton só da lista
└── [id]/
    ├── page.tsx        # /leads/[id]  — 404 real preservado
    └── error.tsx
```

O route group escopa o Suspense à lista sem alterar a rota. `[id]` fica sem
`loading.tsx` de propósito: lê uma linha do SQLite de forma síncrona, então o
skeleton não apareceria de qualquer jeito, e um 404 correto vale mais.

---

## Camadas

```
   Telas (Server Components)
        ↓ chamam
   src/lib/db/queries.ts       ← todo o SQL + métricas
        ↓ usa
   src/lib/domain/             ← regras de negócio, sem SQL, sem React
        ↓ lê
   src/lib/config.ts           ← todos os limites
```

Escrita:

```
   Formulário / botão (Client Component)
        ↓ chama
   src/app/actions.ts          ← "use server", valida a entrada
        ↓ chama
   src/lib/db/queries.ts
        ↓ e então
   revalidatePath()            ← painel e listas se atualizam
```

Regra que mantém isso honesto: **`src/lib/domain/` não importa React nem SQL.**
São funções puras, o que as torna testáveis isoladamente.

---

## Client Components (só quatro)

Quase tudo é Server Component. Viraram cliente apenas onde há estado real:

| Componente | Por quê |
| --- | --- |
| `sidebar.tsx` | `usePathname()` para marcar o item ativo |
| `follow-up-panel.tsx` | clipboard, edição inline, troca de status, confirmação visual |
| `new-lead-form.tsx` | `useActionState` para erros de validação |
| `note-form.tsx` | limpa o campo após salvar |
| `error-state.tsx` | error boundaries precisam ser client components |

Resultado: ~103 kB de JS compartilhado, e as páginas mais pesadas ficam em 110 kB.

---

## Detalhes que valem registro

**Conexão única com o banco.** Guardada em `globalThis` para que o hot reload do
Next não abra um handle novo a cada edição (`src/lib/db/client.ts`).

**WAL ligado.** `PRAGMA journal_mode = WAL` permite leituras concorrentes com
escrita — importante porque o Next atende várias requisições ao mesmo tempo.

**Valor em pt-BR.** `parseCurrencyInput` aceita `4500`, `4.500,00` e `R$ 4.500`.
Se houver vírgula, pontos são separador de milhar. Vendedor não deveria ter que
pensar em formato de número.

**Cópia sem HTTPS.** `navigator.clipboard` só existe em contexto seguro. Se a
ferramenta for aberta por IP na rede local via http, o botão cairia sem barulho —
por isso há um fallback com `document.execCommand("copy")`.

**Rotas dinâmicas.** Painel, lista e detalhe usam `export const dynamic =
"force-dynamic"`: leem o banco a cada requisição, então os números nunca ficam
velhos.

**O alerta ⚠️ da linha do tempo não é persistido.** Ele é calculado na hora, a
partir do estado atual do lead. Guardar isso no banco criaria dados que precisam
ser invalidados — e alertas obsoletos são pior do que nenhum alerta.

---

## O que deliberadamente não existe

Sem autenticação, sem multi-tenant, sem cobrança, sem integração de WhatsApp,
sem envio automático, sem analytics, sem testes automatizados versionados no
repositório, sem CI, sem Docker.

Nada disso ajuda a responder *"o usuário consegue encontrar uma oportunidade
esquecida?"* — que é a única pergunta deste MVP. A lista completa, com o que
seria preciso para cada item, está em
[`proximos-passos.md`](proximos-passos.md).
