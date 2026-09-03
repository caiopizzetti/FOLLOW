# O que NÃO foi construído

Registro honesto do que ficou de fora, por quê, e o que seria preciso para
fazer. Nada aqui é acidente: cada item foi avaliado com a pergunta

> *"Isso ajuda o usuário a encontrar e recuperar uma oportunidade perdida?"*

e ficou de fora porque a resposta, **para o primeiro teste**, era não.

---

## Limitações do que existe hoje

Coisas que funcionam, mas com ressalva — vale saber antes de colocar na frente
de um cliente.

| Limitação | Impacto | Situação |
| --- | --- | --- |
| **Sem login. Quem abre a URL vê tudo.** | Roda local, para uma pessoa | Bloqueia qualquer uso multiusuário |
| **Uma base só, um vendedor só** | Não há dono de lead nem times | Bloqueia venda para equipes |
| **Sem migrações de banco** | Mudar coluna exige recriar o banco | Aceitável em MVP, não em produção |
| **Sem testes automatizados no repositório** | Regressão só aparece manualmente | Verificado com roteiro externo; deveria virar suíte versionada |
| **Sem paginação** | ~500 leads a lista fica pesada | Nenhuma base de teste chega perto |
| **Sem busca por nome** | Achar um lead específico exige olhar a lista | Sentirá falta a partir de ~50 leads |
| **Sem edição de lead** | Corrigir um telefone exige recadastrar | **Provavelmente o primeiro incômodo real** |
| **Sem desfazer** | "Marquei como contatado sem querer" não tem volta | Dá para consertar mudando o status; deselegante |
| **SQLite local** | O banco é um arquivo na máquina | Certo para MVP, errado para vários usuários |
| **Sem fuso configurável por usuário** | Fixo em `America/Sao_Paulo` | Fica em `src/lib/config.ts` |

---

## Não construído — por ordem do que eu faria primeiro

### 1. Editar um lead
**Por que não entrou:** o fluxo a provar era *encontrar e recuperar*, não
*manter cadastro*.
**Por que é o primeiro da fila:** é o único item desta lista que vai incomodar
já no primeiro dia de uso real.
**Esforço:** pequeno — reaproveita o formulário de cadastro e uma action nova.

### 2. Busca e paginação na lista
**Quando começa a doer:** a partir de umas 50 oportunidades.
**Esforço:** pequeno — `WHERE name LIKE ?` e `LIMIT/OFFSET` em `queries.ts`.

### 3. Importação de CSV
**Por que não entrou:** era possível testar a hipótese com cadastro manual e com
o seed.
**Por que importa:** ninguém migra a base à mão. Este é provavelmente o item que
mais decide se a ferramenta é adotada de verdade.
**Esforço:** médio — upload, mapeamento de colunas, validação, prévia antes de
gravar.

### 4. Autenticação e conta de usuário
**Por que não entrou:** foi explicitamente excluído do escopo do MVP.
**O que muda:** deixa de ser "roda no meu computador" e vira produto.
**Esforço:** médio — sessão, hash de senha, escopo de dados por usuário. Na
prática vem junto com o item 5.

### 5. Multi-tenant de verdade
**Por que não entrou:** excluído do escopo.
**O que exige:** trocar SQLite por Postgres, `organization_id` em todas as
tabelas, e verificação de escopo em toda query. Não é um "depois eu adiciono" —
é uma decisão que muda o formato do banco.
**Esforço:** grande. Fazer **antes** do primeiro cliente pagante, não depois.

### 6. Integração real de WhatsApp
**Por que não entrou:** excluído do escopo, e a hipótese não depende disso.
Copiar e colar já prova se o vendedor acha as oportunidades.
**A pegadinha:** a API oficial exige conta Business verificada, templates
aprovados e janela de 24 horas para mensagem livre. As bibliotecas não oficiais
levam a banimento.
**Esforço:** grande, e mais burocrático do que técnico.

### 7. Envio automático de follow-up
**Por que não entrou:** excluído do escopo — e, sinceramente, é a
funcionalidade mais arriscada da lista. Mensagem automática errada custa o
cliente, não só a venda.
**Pré-requisito:** o item 6, mais uma etapa de revisão humana.

### 8. IA na geração das mensagens
**Por que não entrou:** foi pedido explicitamente que não houvesse API paga
neste MVP, e as regras determinísticas já produzem mensagens aproveitáveis.
**Está pronto para receber:** a interface `FollowUpProvider` existe e
`generateFollowUpMessage(lead)` é o único ponto de entrada. Ver
[`arquitetura.md`](arquitetura.md), Decisão 5.
**O que a IA acrescentaria de fato:** personalização com base no histórico de
verdade ("ele perguntou sobre prazo em 14/08"), tom ajustado ao setor,
sugestão do melhor momento de contato.
**Esforço:** pequeno para plugar, médio para ficar bom (prompt, custo por
mensagem, latência, revisão humana).

### 9. Notificações (e-mail ou push)
**Por que não entrou:** o painel já mostra tudo quando o usuário abre.
**Por que vale depois:** o produto só funciona se a pessoa lembrar de abrir. Um
resumo diário de manhã — *"3 oportunidades críticas, R$ 24.500"* — é
provavelmente o que transforma isso em hábito.
**Esforço:** médio — precisa de agendador e de serviço de e-mail.

### 10. Relatórios e analytics
**Por que não entrou:** o pedido era explícito — clareza acima de decoração,
nada de painel cheio de gráfico.
**O único número que valeria:** taxa de recuperação ao longo do tempo, porque é
ele que prova o ROI da ferramenta. A base para isso já existe: a métrica de
"oportunidades recuperadas" já é calculada.

---

## Explicitamente fora de escopo

Excluídos no enunciado do projeto e mantidos fora de propósito:

- CRM completo (pipeline visual, campos personalizados, automações)
- Marketplace ou catálogo de integrações
- Planos, cobrança e assinatura
- Analytics avançado
- App mobile nativo (as telas já respondem bem em 390px)

---

## A pergunta que decide o próximo passo

Antes de construir qualquer coisa desta lista, o teste com usuários reais
precisa responder:

> **O vendedor abre a ferramenta de novo no dia seguinte?**

- **Se sim** — o problema é real. A prioridade vira: editar lead (1), busca (2),
  importar CSV (3), notificações (9) — ou seja, tirar o atrito para virar hábito.
- **Se não** — nada desta lista salva o produto. O problema estará na hipótese,
  não nas funcionalidades que faltam.

Construir os itens 4, 5 e 6 antes de ter essa resposta é gastar semanas na
infraestrutura de um produto que talvez ninguém queira abrir duas vezes.
