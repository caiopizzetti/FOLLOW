-- ============================================================
--  FOLLOW — base de DEMONSTRAÇÃO
--  DADOS 100% FICTÍCIOS. Nenhuma pessoa, empresa, telefone,
--  e-mail ou valor abaixo é real.
-- ------------------------------------------------------------
--  Gerado por: npm run db:sql
--  Cole no console SQL do Turso para popular a base.
--  As datas são relativas a QUANDO este SQL rodar.
-- ============================================================

-- 1. Tabelas
-- Esquema do MVP. Aplicado de forma idempotente na primeira conexao
-- (src/lib/db/client.ts) e pelos scripts em scripts/.

CREATE TABLE IF NOT EXISTS leads (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  company         TEXT,
  value           REAL NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'NOVO'
                    CHECK (status IN ('NOVO','CONTATO','ORCAMENTO','NEGOCIACAO','GANHO','PERDIDO')),
  source          TEXT,
  created_at      TEXT NOT NULL,
  last_contact_at TEXT,
  next_follow_up_at TEXT,
  notes           TEXT
);

CREATE TABLE IF NOT EXISTS history (
  id         TEXT PRIMARY KEY,
  lead_id    TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type       TEXT NOT NULL
               CHECK (type IN ('CONTACT','FOLLOW_UP','RESPONSE','STATUS_CHANGE','NOTE')),
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_history_lead_id ON history(lead_id, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- 2. Limpa qualquer conteúdo anterior
DELETE FROM history;
DELETE FROM leads;

-- 3. Leads fictícios

-- Mariana Alves — Padaria Sol Nascente (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('5967b0bf-89a9-49b3-b534-650cd2917bb2', 'Mariana Alves', '(11) 90000-0001', 'mariana@exemplo.test', 'Padaria Sol Nascente (fictícia)', 4500, 'ORCAMENTO', 'WhatsApp', date('now','-22 days') || 'T12:00:00Z', date('now','-8 days') || 'T12:00:00Z', date('now','-1 days') || 'T12:00:00Z', 'Pediu orçamento para reforma do balcão de atendimento.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('d919687c-8458-41bf-b983-fa5df39e0b6b', '5967b0bf-89a9-49b3-b534-650cd2917bb2', 'CONTACT', 'Primeiro contato pelo WhatsApp.', date('now','-22 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('3de66fad-0b6b-4a31-a4c1-1b7d1559c54a', '5967b0bf-89a9-49b3-b534-650cd2917bb2', 'NOTE', 'Levantamento de necessidades feito por telefone.', date('now','-20 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('cfbe3e86-30fc-42b4-928e-62cd7907eebd', '5967b0bf-89a9-49b3-b534-650cd2917bb2', 'CONTACT', 'Orçamento enviado — R$ 4.500.', date('now','-8 days') || 'T12:00:00Z');

-- Ricardo Nunes — Óticas Vista Clara (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('fc64daad-d078-4103-b89c-0456fb5536f7', 'Ricardo Nunes', '(21) 90000-0002', 'ricardo@exemplo.test', 'Óticas Vista Clara (fictícia)', 2800, 'ORCAMENTO', 'Indicação', date('now','-14 days') || 'T12:00:00Z', date('now','-5 days') || 'T12:00:00Z', date('now','-0 days') || 'T12:00:00Z', 'Indicado por cliente antigo.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('11524c46-4c25-4c81-8702-36343d57ae9f', 'fc64daad-d078-4103-b89c-0456fb5536f7', 'CONTACT', 'Contato inicial por indicação.', date('now','-14 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('8e9e6e9d-a345-48ef-bc89-98a4d09105e8', 'fc64daad-d078-4103-b89c-0456fb5536f7', 'CONTACT', 'Orçamento enviado — R$ 2.800.', date('now','-5 days') || 'T12:00:00Z');

-- Camila Ferreira — TransLog Cargas (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('f40b12f1-572f-493c-9449-b3906d0e933a', 'Camila Ferreira', '(41) 90000-0003', 'camila@exemplo.test', 'TransLog Cargas (fictícia)', 7200, 'NEGOCIACAO', 'Site', date('now','-40 days') || 'T12:00:00Z', date('now','-12 days') || 'T12:00:00Z', date('now','-5 days') || 'T12:00:00Z', 'Comparando com dois concorrentes. Sensível a prazo de entrega.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('e38b8e6a-7026-4c9b-a962-89ca0abef0bc', 'f40b12f1-572f-493c-9449-b3906d0e933a', 'CONTACT', 'Formulário do site preenchido.', date('now','-40 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('92215c09-5892-437a-9465-3f43d124db8c', 'f40b12f1-572f-493c-9449-b3906d0e933a', 'CONTACT', 'Reunião de apresentação realizada.', date('now','-33 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('14a5dcc5-4e6e-4f2f-908d-a136a0f40d1a', 'f40b12f1-572f-493c-9449-b3906d0e933a', 'CONTACT', 'Proposta enviada — R$ 7.200.', date('now','-25 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('a4413245-b5a2-4545-886b-44f97455ce9e', 'f40b12f1-572f-493c-9449-b3906d0e933a', 'RESPONSE', 'Cliente pediu desconto de 10%.', date('now','-18 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('e2cd0097-08bd-4fd6-9705-0afed0fed4ea', 'f40b12f1-572f-493c-9449-b3906d0e933a', 'FOLLOW_UP', 'Enviada contraproposta com 5% de desconto.', date('now','-12 days') || 'T12:00:00Z');

-- Bruno Tavares — Studio Pilates Movimento (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('b69b8f0b-79bb-440b-95ed-47b9527ee4d8', 'Bruno Tavares', '(31) 90000-0004', 'bruno@exemplo.test', 'Studio Pilates Movimento (fictício)', 1800, 'NOVO', 'Instagram', date('now','-9 days') || 'T12:00:00Z', NULL, NULL, 'Chegou pelo anúncio do Instagram e nunca recebeu retorno.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('d9d3b2d2-91e2-4363-8a8e-7c2366d41c79', 'b69b8f0b-79bb-440b-95ed-47b9527ee4d8', 'NOTE', 'Lead capturado pelo anúncio do Instagram.', date('now','-9 days') || 'T12:00:00Z');

-- Patrícia Gomes — Clínica OdontoVida (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('6711c1c1-221e-47dd-a04e-176e6fd58925', 'Patrícia Gomes', '(11) 90000-0005', 'patricia@exemplo.test', 'Clínica OdontoVida (fictícia)', 15400, 'NEGOCIACAO', 'Indicação', date('now','-55 days') || 'T12:00:00Z', date('now','-15 days') || 'T12:00:00Z', date('now','-8 days') || 'T12:00:00Z', 'Maior oportunidade em aberto. Decisão depende do sócio.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('596a6222-bc3d-43cb-8a88-ccc09997702c', '6711c1c1-221e-47dd-a04e-176e6fd58925', 'CONTACT', 'Reunião inicial na clínica.', date('now','-55 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('2eaa62c7-d129-45d5-9aef-34b6a3b25521', '6711c1c1-221e-47dd-a04e-176e6fd58925', 'CONTACT', 'Proposta enviada — R$ 15.400.', date('now','-44 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('1f14d8d8-2a36-44c6-80eb-0eb583581a3a', '6711c1c1-221e-47dd-a04e-176e6fd58925', 'RESPONSE', 'Cliente pediu para aguardar aprovação do sócio.', date('now','-30 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('319b13e6-64f3-4f7d-a013-2db9b24c310c', '6711c1c1-221e-47dd-a04e-176e6fd58925', 'FOLLOW_UP', 'Follow-up enviado perguntando sobre a aprovação.', date('now','-15 days') || 'T12:00:00Z');

-- Eduardo Lima — Mercado Bom Preço (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('7022dc0c-2237-4883-8722-bf73da5638d3', 'Eduardo Lima', '(19) 90000-0006', 'eduardo@exemplo.test', 'Mercado Bom Preço (fictício)', 3200, 'CONTATO', 'Telefone', date('now','-11 days') || 'T12:00:00Z', date('now','-4 days') || 'T12:00:00Z', date('now','-1 days') || 'T12:00:00Z', 'Quer entender melhor o escopo antes de pedir orçamento.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('8f07c969-45cd-4b87-8e79-da1ca91b2b6c', '7022dc0c-2237-4883-8722-bf73da5638d3', 'CONTACT', 'Ligação recebida pedindo informações.', date('now','-11 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('cdee0c58-f396-49bf-af64-f323997c0dcd', '7022dc0c-2237-4883-8722-bf73da5638d3', 'CONTACT', 'Explicado o escopo por telefone.', date('now','-4 days') || 'T12:00:00Z');

-- Fernanda Rocha — Academia Corpo Ativo (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('e6615c60-4390-4b75-baed-3105750f5d80', 'Fernanda Rocha', '(51) 90000-0007', 'fernanda@exemplo.test', 'Academia Corpo Ativo (fictícia)', 9800, 'ORCAMENTO', 'Site', date('now','-60 days') || 'T12:00:00Z', date('now','-21 days') || 'T12:00:00Z', date('now','-14 days') || 'T12:00:00Z', 'Orçamento parado há três semanas. Vale uma tentativa de resgate.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('40caa49b-2f2a-4535-9341-9a99345a37bf', 'e6615c60-4390-4b75-baed-3105750f5d80', 'CONTACT', 'Contato pelo site.', date('now','-60 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('4f72d05f-1bd1-48be-96c8-153008d9bd8d', 'e6615c60-4390-4b75-baed-3105750f5d80', 'CONTACT', 'Visita técnica realizada.', date('now','-50 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('3bf40f95-73a8-4b6c-9904-8d1244de4813', 'e6615c60-4390-4b75-baed-3105750f5d80', 'CONTACT', 'Orçamento enviado — R$ 9.800.', date('now','-21 days') || 'T12:00:00Z');

-- Thiago Barbosa — Auto Center Veloz (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('72f7a01a-b044-4c86-b5d1-27cfe9bfb348', 'Thiago Barbosa', '(11) 90000-0008', 'thiago@exemplo.test', 'Auto Center Veloz (fictício)', 5600, 'ORCAMENTO', 'WhatsApp', date('now','-18 days') || 'T12:00:00Z', date('now','-7 days') || 'T12:00:00Z', date('now','-0 days') || 'T12:00:00Z', 'Demonstrou urgência no primeiro contato e depois sumiu.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('ebaa7a91-2ed4-46cf-a26b-0fde51e47dec', '72f7a01a-b044-4c86-b5d1-27cfe9bfb348', 'CONTACT', 'Contato pelo WhatsApp.', date('now','-18 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('17e4389e-7b7b-4470-b388-43a48595cf87', '72f7a01a-b044-4c86-b5d1-27cfe9bfb348', 'RESPONSE', 'Cliente perguntou prazo de execução.', date('now','-12 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('db5cc4a5-0fad-4f8c-8dfd-d48249054aff', '72f7a01a-b044-4c86-b5d1-27cfe9bfb348', 'CONTACT', 'Orçamento enviado — R$ 5.600.', date('now','-7 days') || 'T12:00:00Z');

-- Juliana Castro — Pet Shop Amigo Fiel (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('e0328feb-d853-4f42-b3a0-fab714c587d8', 'Juliana Castro', '(11) 90000-0009', 'juliana@exemplo.test', 'Pet Shop Amigo Fiel (fictício)', 2400, 'NOVO', 'Indicação', date('now','-2 days') || 'T12:00:00Z', NULL, NULL, 'Lead recente, ainda dentro do prazo.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('5f329af2-2950-4ab7-a488-db547b275e9e', 'e0328feb-d853-4f42-b3a0-fab714c587d8', 'NOTE', 'Lead cadastrado por indicação.', date('now','-2 days') || 'T12:00:00Z');

-- Marcelo Dias — Construtora Horizonte (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('1077ebe3-e635-4c4e-9089-7979c863a33d', 'Marcelo Dias', '(11) 90000-0010', 'marcelo@exemplo.test', 'Construtora Horizonte (fictícia)', 24000, 'NEGOCIACAO', 'Evento', date('now','-35 days') || 'T12:00:00Z', date('now','-6 days') || 'T12:00:00Z', date('now','--1 days') || 'T12:00:00Z', 'Maior ticket da base. Negociando escopo por etapas.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('26ffc7b9-2d45-4075-8c47-5eff5faca99d', '1077ebe3-e635-4c4e-9089-7979c863a33d', 'CONTACT', 'Contato feito em feira do setor.', date('now','-35 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('fcc41fb4-ffca-47ef-a64d-c4e95b357bd8', '1077ebe3-e635-4c4e-9089-7979c863a33d', 'CONTACT', 'Proposta inicial enviada — R$ 24.000.', date('now','-28 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('7a560d12-3e83-4709-834c-2c8e6c9c2acb', '1077ebe3-e635-4c4e-9089-7979c863a33d', 'RESPONSE', 'Cliente pediu divisão do projeto em duas etapas.', date('now','-15 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('13bd576b-76d3-4463-b8ed-130bd8ce6784', '1077ebe3-e635-4c4e-9089-7979c863a33d', 'FOLLOW_UP', 'Enviada proposta revisada em duas etapas.', date('now','-6 days') || 'T12:00:00Z');

-- Aline Moreira — Restaurante Sabor da Terra (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('fb91a733-6df4-4603-ad4c-0be0fdde022b', 'Aline Moreira', '(11) 90000-0011', 'aline@exemplo.test', 'Restaurante Sabor da Terra (fictício)', 3900, 'CONTATO', 'WhatsApp', date('now','-6 days') || 'T12:00:00Z', date('now','-1 days') || 'T12:00:00Z', date('now','--2 days') || 'T12:00:00Z', 'Conversa acontecendo agora, nada parado.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('cf928d17-783d-4ffa-9635-49a075ca9c52', 'fb91a733-6df4-4603-ad4c-0be0fdde022b', 'CONTACT', 'Primeiro contato pelo WhatsApp.', date('now','-6 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('b632e3cc-99bb-4e96-8f3a-2e880602a864', 'fb91a733-6df4-4603-ad4c-0be0fdde022b', 'CONTACT', 'Alinhamento de escopo por telefone.', date('now','-1 days') || 'T12:00:00Z');

-- Rafael Pinto — Escola Futuro Brilhante (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('a66fd171-6d69-462c-bd43-9b09b7344fea', 'Rafael Pinto', '(62) 90000-0012', 'rafael@exemplo.test', 'Escola Futuro Brilhante (fictícia)', 11500, 'ORCAMENTO', 'Site', date('now','-27 days') || 'T12:00:00Z', date('now','-9 days') || 'T12:00:00Z', date('now','-2 days') || 'T12:00:00Z', 'Orçamento aprovado internamente, aguardando assinatura.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('7ed28365-675a-4322-ac19-6db9713ae6a8', 'a66fd171-6d69-462c-bd43-9b09b7344fea', 'CONTACT', 'Contato pelo site.', date('now','-27 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('7a1c33f4-ac14-40d9-b91f-b4beecbccbb6', 'a66fd171-6d69-462c-bd43-9b09b7344fea', 'CONTACT', 'Reunião com a diretoria.', date('now','-20 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('ca155256-54f0-45ac-857e-bb32b1fdb211', 'a66fd171-6d69-462c-bd43-9b09b7344fea', 'CONTACT', 'Orçamento enviado — R$ 11.500.', date('now','-9 days') || 'T12:00:00Z');

-- Vanessa Duarte — Salão Beleza Real (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('97dfbdac-5beb-4688-a407-f0eafdfacf18', 'Vanessa Duarte', '(11) 90000-0013', 'vanessa@exemplo.test', 'Salão Beleza Real (fictício)', 1600, 'PERDIDO', 'Instagram', date('now','-48 days') || 'T12:00:00Z', date('now','-30 days') || 'T12:00:00Z', NULL, 'Fechou com concorrente por preço.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('f871b2f8-7f76-4b6a-9a0c-82f8e8d7e75e', '97dfbdac-5beb-4688-a407-f0eafdfacf18', 'CONTACT', 'Contato pelo Instagram.', date('now','-48 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('00608d74-feee-4fc3-b501-5b03450f5984', '97dfbdac-5beb-4688-a407-f0eafdfacf18', 'CONTACT', 'Orçamento enviado — R$ 1.600.', date('now','-40 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('5ae52745-7ded-4f01-a586-237d01279e48', '97dfbdac-5beb-4688-a407-f0eafdfacf18', 'STATUS_CHANGE', 'Status alterado para Perdido — fechou com concorrente.', date('now','-30 days') || 'T12:00:00Z');

-- Gustavo Mendes — Distribuidora Norte Sul (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('15663f02-2c87-40a1-976a-9b0217613629', 'Gustavo Mendes', '(85) 90000-0014', 'gustavo@exemplo.test', 'Distribuidora Norte Sul (fictícia)', 8700, 'GANHO', 'Indicação', date('now','-52 days') || 'T12:00:00Z', date('now','-10 days') || 'T12:00:00Z', NULL, 'Fechou depois de um follow-up de resgate — exemplo de oportunidade recuperada.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('5bdd8485-df07-4019-9f2e-11d9c7a88791', '15663f02-2c87-40a1-976a-9b0217613629', 'CONTACT', 'Contato inicial por indicação.', date('now','-52 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('5a2fcbb3-336f-482c-84f8-bd4cc4b4d3e5', '15663f02-2c87-40a1-976a-9b0217613629', 'CONTACT', 'Orçamento enviado — R$ 8.700.', date('now','-45 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('3b8b2ff2-060a-42c2-be78-123a68e564fb', '15663f02-2c87-40a1-976a-9b0217613629', 'NOTE', 'Sem resposta do cliente por duas semanas.', date('now','-30 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('a23a99ad-0a2f-4c36-bd3b-098fc45c4457', '15663f02-2c87-40a1-976a-9b0217613629', 'FOLLOW_UP', 'Follow-up de resgate enviado pelo FOLLOW.', date('now','-16 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('e0ddc9e5-4b29-4a76-bc87-99e9c512ec8f', '15663f02-2c87-40a1-976a-9b0217613629', 'RESPONSE', 'Cliente retomou a conversa e pediu a nota.', date('now','-13 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('b2a2aa00-54d8-4815-aa67-d325225a5ebd', '15663f02-2c87-40a1-976a-9b0217613629', 'STATUS_CHANGE', 'Status alterado para Ganho.', date('now','-10 days') || 'T12:00:00Z');

-- Larissa Campos — Café Grão Fino (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('0ba6fadc-bdbc-4257-b466-3fda21211514', 'Larissa Campos', '(11) 90000-0015', 'larissa@exemplo.test', 'Café Grão Fino (fictício)', 2100, 'GANHO', 'Site', date('now','-33 days') || 'T12:00:00Z', date('now','-18 days') || 'T12:00:00Z', NULL, 'Ciclo curto, fechou sem precisar de follow-up.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('066ba5ff-2803-4cdd-9558-b9cc83731c14', '0ba6fadc-bdbc-4257-b466-3fda21211514', 'CONTACT', 'Contato pelo site.', date('now','-33 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('9b41b722-c983-4027-8a2e-b207e139b4cb', '0ba6fadc-bdbc-4257-b466-3fda21211514', 'CONTACT', 'Orçamento enviado — R$ 2.100.', date('now','-25 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('a6a1016d-000b-4c75-a154-8afb253ac366', '0ba6fadc-bdbc-4257-b466-3fda21211514', 'STATUS_CHANGE', 'Status alterado para Ganho.', date('now','-18 days') || 'T12:00:00Z');

-- Diego Ramos — Lavanderia Água Viva (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('1039145a-333b-416b-8f47-e6a9e6202af0', 'Diego Ramos', '(11) 90000-0016', 'diego@exemplo.test', 'Lavanderia Água Viva (fictícia)', 3400, 'PERDIDO', 'Telefone', date('now','-70 days') || 'T12:00:00Z', date('now','-45 days') || 'T12:00:00Z', NULL, 'Adiou o projeto por tempo indeterminado.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('b547c86b-44e2-454a-94eb-9a9f0ef8ddb3', '1039145a-333b-416b-8f47-e6a9e6202af0', 'CONTACT', 'Ligação recebida.', date('now','-70 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('64a9b91c-6004-48d8-828c-c8573367aeb8', '1039145a-333b-416b-8f47-e6a9e6202af0', 'CONTACT', 'Orçamento enviado — R$ 3.400.', date('now','-62 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('cd33f975-54c5-4244-939c-6350a1a5e7aa', '1039145a-333b-416b-8f47-e6a9e6202af0', 'STATUS_CHANGE', 'Status alterado para Perdido — projeto adiado.', date('now','-45 days') || 'T12:00:00Z');

-- Sofia Nogueira — Imobiliária Terra Firme (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('88589a28-876b-4db2-a90e-1c70fb72b4c6', 'Sofia Nogueira', '(48) 90000-0017', 'sofia@exemplo.test', 'Imobiliária Terra Firme (fictícia)', 6300, 'ORCAMENTO', 'Site', date('now','-12 days') || 'T12:00:00Z', date('now','-3 days') || 'T12:00:00Z', date('now','-0 days') || 'T12:00:00Z', 'Acabou de entrar na faixa de atenção.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('07bff03d-33c4-47f7-bf4d-f98d688518d6', '88589a28-876b-4db2-a90e-1c70fb72b4c6', 'CONTACT', 'Contato pelo site.', date('now','-12 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('831667d4-e21e-4230-93fb-09cfb7c6f973', '88589a28-876b-4db2-a90e-1c70fb72b4c6', 'CONTACT', 'Orçamento enviado — R$ 6.300.', date('now','-3 days') || 'T12:00:00Z');

-- Henrique Vasconcelos — Metalúrgica Aço Forte (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('52ac30b0-9cf2-41ef-baf5-a2dd6976522a', 'Henrique Vasconcelos', '(11) 90000-0018', 'henrique@exemplo.test', 'Metalúrgica Aço Forte (fictícia)', 18900, 'NEGOCIACAO', 'Evento', date('now','-44 days') || 'T12:00:00Z', date('now','-11 days') || 'T12:00:00Z', date('now','-4 days') || 'T12:00:00Z', 'Negociação avançada travada na condição de pagamento.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('9f050c40-6fd2-47a6-aae6-46ed57374afb', '52ac30b0-9cf2-41ef-baf5-a2dd6976522a', 'CONTACT', 'Contato feito em evento do setor.', date('now','-44 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('2bb2ef77-ef80-417a-9db0-9f8a7896f32f', '52ac30b0-9cf2-41ef-baf5-a2dd6976522a', 'CONTACT', 'Proposta enviada — R$ 18.900.', date('now','-36 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('ba0a68b4-6c76-4e4c-86ad-e826f3dceb23', '52ac30b0-9cf2-41ef-baf5-a2dd6976522a', 'RESPONSE', 'Cliente pediu parcelamento em 6x.', date('now','-22 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('e9336603-0ea9-4bff-aff4-1f001ea63391', '52ac30b0-9cf2-41ef-baf5-a2dd6976522a', 'FOLLOW_UP', 'Enviada condição de pagamento revisada.', date('now','-11 days') || 'T12:00:00Z');

-- Conferência: devem aparecer 18 leads.
SELECT COUNT(*) AS leads FROM leads;
SELECT COUNT(*) AS eventos FROM history;
