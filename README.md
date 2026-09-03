# FOLLOW

**Ferramenta de recuperação de oportunidades perdidas por falta de follow-up.**

Não é um CRM. O produto existe para responder uma pergunta só:

> Quais oportunidades a empresa está deixando escapar porque ninguém deu retorno?

Você abre o painel, vê quanto dinheiro está parado, clica no lead mais urgente,
copia a mensagem sugerida, faz o contato e marca como contatado. O lead sai da
fila. Fim.

---

## Índice

- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Criar o banco e inserir o seed](#criar-o-banco-e-inserir-o-seed)
- [Rodar](#rodar)
- [Como testar](#como-testar)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Configuração das regras](#configuração-das-regras)
- [Problemas comuns](#problemas-comuns)
- [Documentação](#documentação)

---

## Requisitos

| Item | Versão | Por quê |
| --- | --- | --- |
| Node.js | **20 ou superior** | Requisito do Next 15 e do cliente libSQL |
| npm | 10+ | Acompanha o Node 22 |

Confira com:

```bash
node -v   # precisa ser >= v20
```

Não é necessário instalar SQLite, Docker, Postgres nem compilar módulo nativo:
o banco local é um arquivo, criado automaticamente.

---

## Instalação

```bash
git clone <url-do-repositorio>
cd FOLLOW
npm install
```

---

## Criar o banco e inserir o seed

O banco é um arquivo SQLite em `data/follow.db`. Ele é criado sozinho na
primeira execução, mas para a demonstração vale popular com dados fictícios:

```bash
npm run setup
```

Esse comando faz duas coisas:

1. `npm run db:reset` — cria/limpa as tabelas
2. `npm run db:seed` — insere **18 leads fictícios** com histórico

Saída esperada:

```
Banco limpo: /caminho/FOLLOW/data/follow.db
Seed aplicado em /caminho/FOLLOW/data/follow.db
  18 leads fictícios
  54 eventos de histórico
Lembrete: todos os dados são fictícios, apenas para demonstração.
```

> ⚠️ **Os dados do seed são 100% inventados.** Nenhuma pessoa, empresa,
> telefone, e-mail ou valor é real. Os e-mails usam o domínio reservado
> `.test` e as empresas trazem "(fictícia)" no nome. Veja
> `scripts/seed-data.mjs`.

As datas do seed são **relativas ao dia em que você roda o comando**, então a
demonstração sempre mostra leads realmente parados — não importa quando você
executar.

---

## Rodar

```bash
npm run dev
```

Abra: **http://localhost:3000**

A raiz redireciona para `/dashboard`.

Para rodar a versão de produção:

```bash
npm run build
npm start
```

---

## Como testar

Roteiro de 2 minutos que exercita o fluxo principal ponta a ponta:

### 1. Painel — encontrar o que está parado

1. Abra <http://localhost:3000/dashboard>
2. Confira o título: *"12 oportunidades precisam de ação"*
3. Confira os quatro cards: quantidade, valor parado, quantos estão críticos e
   quanto dinheiro há nos críticos
4. A fila abaixo vem ordenada por urgência e depois por valor

### 2. Lead — entender por que ele foi sinalizado

4. Clique no primeiro lead da fila
5. Veja o bloco **"Por que apareceu aqui"** — ex.: *"Negociação parada há 11 dias."*
6. Role até **Histórico**: a linha do tempo termina em
   *"⚠️ Follow-up recomendado"*

### 3. Follow-up — agir

7. Em **Próxima ação**, clique em **Copiar mensagem** → o botão vira *"Copiada!"*
8. Clique em **Editar**, mude o texto, clique em **Concluir edição**
9. Clique em **Marcar como contatado**

**O que deve acontecer:** aparece a confirmação verde *"Follow-up registrado."*

### 4. Verificar que o estado mudou de verdade

10. Recarregue a página do lead:
    - o motivo passa a ser *"Interação registrada hoje."*
    - o alerta ⚠️ sumiu da linha do tempo
    - a mensagem enviada aparece no histórico como **FOLLOW-UP**
11. Volte ao painel: o lead **saiu da fila** e o contador caiu em 1

### 5. Status e histórico

12. No lead, troque o status no seletor (ex.: para **Ganho**) — salva sozinho
13. Recarregue: o histórico registrou *"Status alterado de … para …"*
14. Escreva algo no campo de anotação e clique em **Adicionar ao histórico**

### 6. Filtros

15. Vá em **Oportunidades** e teste: Todos, Precisam de ação, Críticos, Hoje,
    Ganhos, Perdidos — cada aba mostra a contagem

### 7. Cadastro

16. Clique em **Nova oportunidade**
17. Preencha o nome (único campo obrigatório) e um valor como `4.500,00`
18. Clique em **Adicionar oportunidade**

**O que deve acontecer:** você é levado para a página do novo lead, que já
aparece na listagem e já entra no cálculo do painel.

### 8. Responsividade

19. Reduza a janela para ~390px de largura — nenhuma tela deve ter rolagem
    horizontal

### Verificações automáticas

```bash
npm run lint        # ESLint sem erros nem avisos
npm run typecheck   # TypeScript sem erros
npm run build       # build de produção
```

---

## Scripts disponíveis

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento em <http://localhost:3000> |
| `npm run build` | Build de produção |
| `npm start` | Roda o build de produção |
| `npm run lint` | ESLint (flat config, regras do Next) |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `npm run db:push` | Cria as tabelas no banco alvo (usado antes do 1º deploy) |
| `npm run db:reset` | Limpa as tabelas (mantém o arquivo do banco) |
| `npm run db:seed` | Insere os dados fictícios de demonstração |
| `npm run setup` | `db:reset` + `db:seed` |

`db:seed` recusa rodar sobre um banco que já tem leads, para não duplicar a
base. Use `npm run setup` quando quiser recomeçar do zero.

---

## Estrutura do projeto

```
FOLLOW/
├── data/
│   └── follow.db              # banco SQLite (ignorado pelo git)
├── docs/
│   ├── arquitetura.md         # decisões técnicas e o porquê de cada uma
│   ├── mvp.md                 # o que o MVP faz, em detalhe
│   └── proximos-passos.md     # o que NÃO foi construído
├── scripts/
│   ├── db.mjs                 # abre o SQLite e aplica o schema
│   ├── reset.mjs              # npm run db:reset
│   ├── seed.mjs               # npm run db:seed
│   └── seed-data.mjs          # OS 18 LEADS FICTÍCIOS
└── src/
    ├── app/
    │   ├── actions.ts         # Server Actions (única porta de escrita)
    │   ├── layout.tsx         # casca + sidebar
    │   ├── global-error.tsx   # rede de segurança do layout raiz
    │   ├── not-found.tsx      # 404
    │   ├── dashboard/
    │   │   ├── page.tsx       # /dashboard
    │   │   ├── loading.tsx    # skeleton
    │   │   └── error.tsx      # erro + "tentar de novo"
    │   └── leads/
    │       ├── error.tsx      # erro de toda a subárvore /leads
    │       ├── (list)/        # route group — ver docs/arquitetura.md, Decisão 7
    │       │   ├── page.tsx   # /leads  (lista + filtros)
    │       │   └── loading.tsx
    │       ├── new/page.tsx   # /leads/new
    │       └── [id]/
    │           ├── page.tsx   # /leads/[id]
    │           └── error.tsx
    ├── components/            # UI (sidebar, badges, cards, formulários, follow-up)
    └── lib/
        ├── config.ts          # ⭐ TODOS OS LIMITES DO PRODUTO
        ├── format.ts          # moeda, datas, contagem de dias
        ├── db/
        │   ├── schema.sql     # tabelas leads + history
        │   ├── client.ts      # conexão node:sqlite
        │   └── queries.ts     # todo o SQL + métricas do painel
        └── domain/
            ├── types.ts       # Lead, HistoryEntry, status, prioridades
            ├── stale.ts       # ⭐ REGRA DE "LEAD PARADO"
            └── follow-up/
                ├── index.ts   # generateFollowUpMessage(lead)
                ├── provider.ts# interface para plugar IA depois
                └── rules.ts   # mensagens por regras (sem IA)
```

### Rotas

| Rota | Função |
| --- | --- |
| `/` | Redireciona para `/dashboard` |
| `/dashboard` | Números do que está parado + fila de ação |
| `/leads` | Lista completa com filtros e ordenação |
| `/leads/[id]` | Detalhe, motivo do alerta, mensagem sugerida, histórico |
| `/leads/new` | Cadastro manual |

Não há nenhuma página além dessas.

---

## Configuração das regras

Tudo que define "lead parado" está em **`src/lib/config.ts`**:

```ts
export const followUpConfig = {
  thresholds: {
    critical: 7,   // 7+ dias sem interação  -> CRÍTICO
    warning: 3,    // 3 a 6 dias             -> ATENÇÃO
  },                // 0 a 2 dias            -> NORMAL
  nextFollowUpInDays: 3,     // ao marcar contato, agenda o próximo
  includeNeverContacted: true,
  timeZone: "America/Sao_Paulo",
  currency: "BRL",
  locale: "pt-BR",
};
```

Mude os números aqui e o painel, os filtros, as prioridades e os textos de
alerta se ajustam juntos. Não há valor de prazo escrito em nenhuma tela.

**A regra completa** (`src/lib/domain/stale.ts`): um lead precisa de follow-up
quando *não está ganho nem perdido*, *já teve contato/orçamento ou é um lead
novo nunca contatado*, e passou de `warning` dias sem interação. A contagem usa
`lastContactAt` e, se nunca houve contato, `createdAt`.

---

## Problemas comuns

**`SyntaxError: Unexpected end of JSON input` ao rodar `npm run dev`**
Você provavelmente alternou entre `npm run build` e `npm run dev` na mesma pasta
e o cache do Next ficou inconsistente. Resolve com:

```bash
rm -rf .next && npm run dev
```

**`ExperimentalWarning: SQLite is an experimental feature`**
Esperado e inofensivo. É o aviso do Node sobre o módulo `node:sqlite`.

**`Cannot find module 'node:sqlite'`**
Seu Node é anterior à 22.5. Atualize.

**O painel mostra zero oportunidades**
O banco está vazio. Rode `npm run setup`.

**`db:seed` diz que o banco já tem leads**
É proteção contra duplicar a base. Use `npm run setup`.

---

## Deploy

A aplicação roda na **Vercel**, com o banco hospedado no **Turso**.

### Por que o banco mudou

O SQLite em arquivo não funciona em serverless: na Vercel o sistema de
arquivos do bundle é somente-leitura e o `/tmp` é efêmero e por instância.
Como criar lead, marcar follow-up e mudar status são **escritas**, os dados se
perderiam a cada requisição.

A solução foi trocar o driver, não o banco: `@libsql/client` fala o mesmo
dialeto SQLite, então **todo o SQL e toda a lógica continuam iguais**. O mesmo
código atende os dois ambientes:

| Ambiente | Banco |
| --- | --- |
| Local (`npm run dev`) | arquivo `data/follow.db` |
| Produção (Vercel) | Turso, via `TURSO_DATABASE_URL` |

### Variáveis de ambiente

| Variável | Onde | Obrigatória |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | Vercel → Settings → Environment Variables | sim, em produção |
| `TURSO_AUTH_TOKEN` | idem | sim, em produção |

Nunca comite esses valores. Use `.env.example` como referência e
`.env.local` (ignorado pelo git) para desenvolvimento.

Se as variáveis faltarem, a aplicação **sobe mesmo assim** e mostra uma tela
explicando o que configurar — em vez de um erro genérico.

### Primeiro deploy

```bash
# 1. criar o banco no Turso (uma vez)
turso db create follow
turso db show follow --url          # -> TURSO_DATABASE_URL
turso db tokens create follow       # -> TURSO_AUTH_TOKEN

# 2. criar as tabelas e popular a demo
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:push
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:seed

# 3. publicar
vercel --prod
```

### Deploys seguintes

Depois que o projeto está conectado ao repositório na Vercel, **todo push para
a branch de produção publica sozinho**. Para publicar manualmente:

```bash
vercel --prod
```

O banco não é tocado pelo deploy: schema e dados vivem no Turso e sobrevivem a
qualquer publicação.

---

## Documentação

- [`docs/mvp.md`](docs/mvp.md) — o que o MVP faz, tela por tela
- [`docs/arquitetura.md`](docs/arquitetura.md) — decisões técnicas e trade-offs
- [`docs/proximos-passos.md`](docs/proximos-passos.md) — o que **não** foi construído

---

## Observação sobre IA

Este MVP **não usa IA e não chama nenhuma API paga**. As mensagens de follow-up
vêm de regras determinísticas em `src/lib/domain/follow-up/rules.ts`.

A arquitetura já está pronta para a troca: existe a interface `FollowUpProvider`
e um ponto único de entrada, `generateFollowUpMessage(lead)`. Plugar um modelo
depois é escrever um provider novo e trocar uma linha em
`src/lib/domain/follow-up/index.ts`. Nenhuma tela precisa mudar.
