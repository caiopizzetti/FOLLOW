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
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('4a1bf0b9-44c1-4f6c-b692-fa0968f0dd7e', 'Mariana Alves', '(11) 90000-0001', 'mariana@exemplo.test', 'Padaria Sol Nascente (fictícia)', 4500, 'ORCAMENTO', 'WhatsApp', date('now','-22 days') || 'T12:00:00Z', date('now','-8 days') || 'T12:00:00Z', date('now','-1 days') || 'T12:00:00Z', 'Pediu orçamento para reforma do balcão de atendimento.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('6c573597-846b-42d6-a88a-03e6bccfa88e', '4a1bf0b9-44c1-4f6c-b692-fa0968f0dd7e', 'CONTACT', 'Primeiro contato pelo WhatsApp.', date('now','-22 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('c47232c5-e4c7-4c42-9194-d95c9635e099', '4a1bf0b9-44c1-4f6c-b692-fa0968f0dd7e', 'NOTE', 'Levantamento de necessidades feito por telefone.', date('now','-20 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('95e6163a-5eea-4cda-a733-95d1161edac6', '4a1bf0b9-44c1-4f6c-b692-fa0968f0dd7e', 'CONTACT', 'Orçamento enviado — R$ 4.500.', date('now','-8 days') || 'T12:00:00Z');

-- Ricardo Nunes — Óticas Vista Clara (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('5914a166-242b-4a23-995b-e4f6aabbe4ab', 'Ricardo Nunes', '(21) 90000-0002', 'ricardo@exemplo.test', 'Óticas Vista Clara (fictícia)', 2800, 'ORCAMENTO', 'Indicação', date('now','-14 days') || 'T12:00:00Z', date('now','-5 days') || 'T12:00:00Z', date('now','-0 days') || 'T12:00:00Z', 'Indicado por cliente antigo.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('c76e104e-f60d-4d6f-95f5-e1cdf9e84809', '5914a166-242b-4a23-995b-e4f6aabbe4ab', 'CONTACT', 'Contato inicial por indicação.', date('now','-14 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('bb95b7fe-5751-4066-bb54-09aa8ffcabd2', '5914a166-242b-4a23-995b-e4f6aabbe4ab', 'CONTACT', 'Orçamento enviado — R$ 2.800.', date('now','-5 days') || 'T12:00:00Z');

-- Camila Ferreira — TransLog Cargas (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('4461f00d-18c2-4118-8e7c-a2d37bb26d0a', 'Camila Ferreira', '(41) 90000-0003', 'camila@exemplo.test', 'TransLog Cargas (fictícia)', 7200, 'NEGOCIACAO', 'Site', date('now','-40 days') || 'T12:00:00Z', date('now','-12 days') || 'T12:00:00Z', date('now','-5 days') || 'T12:00:00Z', 'Comparando com dois concorrentes. Sensível a prazo de entrega.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('e9647d29-ab16-4a54-94c7-ef348ff5835b', '4461f00d-18c2-4118-8e7c-a2d37bb26d0a', 'CONTACT', 'Formulário do site preenchido.', date('now','-40 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('f084eb00-6b13-4e86-9b2b-7d25e2a7bb37', '4461f00d-18c2-4118-8e7c-a2d37bb26d0a', 'CONTACT', 'Reunião de apresentação realizada.', date('now','-33 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('739aff38-d1ea-4ede-b237-2c0048cc061b', '4461f00d-18c2-4118-8e7c-a2d37bb26d0a', 'CONTACT', 'Proposta enviada — R$ 7.200.', date('now','-25 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('c47a4751-23ca-454c-9db0-a3abd329718a', '4461f00d-18c2-4118-8e7c-a2d37bb26d0a', 'RESPONSE', 'Cliente pediu desconto de 10%.', date('now','-18 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('7b7abd17-18d1-4571-a16c-a9cd7958bc97', '4461f00d-18c2-4118-8e7c-a2d37bb26d0a', 'FOLLOW_UP', 'Enviada contraproposta com 5% de desconto.', date('now','-12 days') || 'T12:00:00Z');

-- Bruno Tavares — Studio Pilates Movimento (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('9b4851a1-1065-4274-a872-67bee5410ad8', 'Bruno Tavares', '(31) 90000-0004', 'bruno@exemplo.test', 'Studio Pilates Movimento (fictício)', 1800, 'NOVO', 'Instagram', date('now','-9 days') || 'T12:00:00Z', NULL, NULL, 'Chegou pelo anúncio do Instagram e nunca recebeu retorno.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('1380a251-3b27-4fce-9a8d-314bec546638', '9b4851a1-1065-4274-a872-67bee5410ad8', 'NOTE', 'Lead capturado pelo anúncio do Instagram.', date('now','-9 days') || 'T12:00:00Z');

-- Patrícia Gomes — Clínica OdontoVida (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('130c1dc7-6faa-4926-b03b-e32f74bd95df', 'Patrícia Gomes', '(11) 90000-0005', 'patricia@exemplo.test', 'Clínica OdontoVida (fictícia)', 15400, 'NEGOCIACAO', 'Indicação', date('now','-55 days') || 'T12:00:00Z', date('now','-15 days') || 'T12:00:00Z', date('now','-8 days') || 'T12:00:00Z', 'Maior oportunidade em aberto. Decisão depende do sócio.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('fb81cb15-45d7-4e8d-91ea-1610544184c7', '130c1dc7-6faa-4926-b03b-e32f74bd95df', 'CONTACT', 'Reunião inicial na clínica.', date('now','-55 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('92b441fc-e74d-44cb-a720-a176663e6dc7', '130c1dc7-6faa-4926-b03b-e32f74bd95df', 'CONTACT', 'Proposta enviada — R$ 15.400.', date('now','-44 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('22017936-de16-4d21-9c7e-068938561c98', '130c1dc7-6faa-4926-b03b-e32f74bd95df', 'RESPONSE', 'Cliente pediu para aguardar aprovação do sócio.', date('now','-30 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('a5d99cca-b1ba-4b0c-99c3-289377a39f5c', '130c1dc7-6faa-4926-b03b-e32f74bd95df', 'FOLLOW_UP', 'Follow-up enviado perguntando sobre a aprovação.', date('now','-15 days') || 'T12:00:00Z');

-- Eduardo Lima — Mercado Bom Preço (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('829644f0-6653-47b1-ab9f-0cb5e2becf95', 'Eduardo Lima', '(19) 90000-0006', 'eduardo@exemplo.test', 'Mercado Bom Preço (fictício)', 3200, 'CONTATO', 'Telefone', date('now','-11 days') || 'T12:00:00Z', date('now','-4 days') || 'T12:00:00Z', date('now','-1 days') || 'T12:00:00Z', 'Quer entender melhor o escopo antes de pedir orçamento.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('e500ac14-f8e8-4fc0-8628-75b4b2af75a3', '829644f0-6653-47b1-ab9f-0cb5e2becf95', 'CONTACT', 'Ligação recebida pedindo informações.', date('now','-11 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('f410497b-f46b-4d5d-bf74-e655274a1fc4', '829644f0-6653-47b1-ab9f-0cb5e2becf95', 'CONTACT', 'Explicado o escopo por telefone.', date('now','-4 days') || 'T12:00:00Z');

-- Fernanda Rocha — Academia Corpo Ativo (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('fce8db9c-7f23-49e4-ba12-18e39f85ecd0', 'Fernanda Rocha', '(51) 90000-0007', 'fernanda@exemplo.test', 'Academia Corpo Ativo (fictícia)', 9800, 'ORCAMENTO', 'Site', date('now','-60 days') || 'T12:00:00Z', date('now','-21 days') || 'T12:00:00Z', date('now','-14 days') || 'T12:00:00Z', 'Orçamento parado há três semanas. Vale uma tentativa de resgate.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('c4547c9e-b88b-44fd-88dd-fb77e8db0551', 'fce8db9c-7f23-49e4-ba12-18e39f85ecd0', 'CONTACT', 'Contato pelo site.', date('now','-60 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('8719a9bc-bbc3-4657-808f-89c1d9fd00d5', 'fce8db9c-7f23-49e4-ba12-18e39f85ecd0', 'CONTACT', 'Visita técnica realizada.', date('now','-50 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('f5ab7205-3ac8-49f8-bbd2-b5167179c416', 'fce8db9c-7f23-49e4-ba12-18e39f85ecd0', 'CONTACT', 'Orçamento enviado — R$ 9.800.', date('now','-21 days') || 'T12:00:00Z');

-- Thiago Barbosa — Auto Center Veloz (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('c0073903-e1b5-453d-bd80-5117a0ad369b', 'Thiago Barbosa', '(11) 90000-0008', 'thiago@exemplo.test', 'Auto Center Veloz (fictício)', 5600, 'ORCAMENTO', 'WhatsApp', date('now','-18 days') || 'T12:00:00Z', date('now','-7 days') || 'T12:00:00Z', date('now','-0 days') || 'T12:00:00Z', 'Demonstrou urgência no primeiro contato e depois sumiu.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('313f019d-2508-4710-8cfd-213f45f7c29e', 'c0073903-e1b5-453d-bd80-5117a0ad369b', 'CONTACT', 'Contato pelo WhatsApp.', date('now','-18 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('4ce07ecc-bcb1-4eb1-82e6-75f1d368af7e', 'c0073903-e1b5-453d-bd80-5117a0ad369b', 'RESPONSE', 'Cliente perguntou prazo de execução.', date('now','-12 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('fc997b2d-a049-45cf-9021-3715f96b6e82', 'c0073903-e1b5-453d-bd80-5117a0ad369b', 'CONTACT', 'Orçamento enviado — R$ 5.600.', date('now','-7 days') || 'T12:00:00Z');

-- Juliana Castro — Pet Shop Amigo Fiel (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('a4a53aa3-ac7c-46b7-862c-cd68698974dd', 'Juliana Castro', '(11) 90000-0009', 'juliana@exemplo.test', 'Pet Shop Amigo Fiel (fictício)', 2400, 'NOVO', 'Indicação', date('now','-2 days') || 'T12:00:00Z', NULL, NULL, 'Lead recente, ainda dentro do prazo.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('bf003a15-4900-4816-a284-250b6786891d', 'a4a53aa3-ac7c-46b7-862c-cd68698974dd', 'NOTE', 'Lead cadastrado por indicação.', date('now','-2 days') || 'T12:00:00Z');

-- Marcelo Dias — Construtora Horizonte (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('73c16823-cd7e-47f9-8b7f-4455b1f1de67', 'Marcelo Dias', '(11) 90000-0010', 'marcelo@exemplo.test', 'Construtora Horizonte (fictícia)', 24000, 'NEGOCIACAO', 'Evento', date('now','-35 days') || 'T12:00:00Z', date('now','-6 days') || 'T12:00:00Z', date('now','--1 days') || 'T12:00:00Z', 'Maior ticket da base. Negociando escopo por etapas.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('0fb19b6d-06aa-429e-8d8c-b5217872d8fd', '73c16823-cd7e-47f9-8b7f-4455b1f1de67', 'CONTACT', 'Contato feito em feira do setor.', date('now','-35 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('baa96ac8-ff6a-4117-9398-929408bfa783', '73c16823-cd7e-47f9-8b7f-4455b1f1de67', 'CONTACT', 'Proposta inicial enviada — R$ 24.000.', date('now','-28 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('17398a9c-6926-4eb0-9396-501d0c5cbd09', '73c16823-cd7e-47f9-8b7f-4455b1f1de67', 'RESPONSE', 'Cliente pediu divisão do projeto em duas etapas.', date('now','-15 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('24dc2b12-0ca2-4b39-b085-acb20026b9e6', '73c16823-cd7e-47f9-8b7f-4455b1f1de67', 'FOLLOW_UP', 'Enviada proposta revisada em duas etapas.', date('now','-6 days') || 'T12:00:00Z');

-- Aline Moreira — Restaurante Sabor da Terra (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('e806a7be-88c7-4295-9042-246045e56f61', 'Aline Moreira', '(11) 90000-0011', 'aline@exemplo.test', 'Restaurante Sabor da Terra (fictício)', 3900, 'CONTATO', 'WhatsApp', date('now','-6 days') || 'T12:00:00Z', date('now','-1 days') || 'T12:00:00Z', date('now','--2 days') || 'T12:00:00Z', 'Conversa acontecendo agora, nada parado.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('85877c70-75cd-41a4-9ed7-ae763650955c', 'e806a7be-88c7-4295-9042-246045e56f61', 'CONTACT', 'Primeiro contato pelo WhatsApp.', date('now','-6 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('5e5d345f-9c22-40d7-bc7a-475b4915c14c', 'e806a7be-88c7-4295-9042-246045e56f61', 'CONTACT', 'Alinhamento de escopo por telefone.', date('now','-1 days') || 'T12:00:00Z');

-- Rafael Pinto — Escola Futuro Brilhante (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('9a96d969-c39d-4ab8-bbae-5921f2b3d41e', 'Rafael Pinto', '(62) 90000-0012', 'rafael@exemplo.test', 'Escola Futuro Brilhante (fictícia)', 11500, 'ORCAMENTO', 'Site', date('now','-27 days') || 'T12:00:00Z', date('now','-9 days') || 'T12:00:00Z', date('now','-2 days') || 'T12:00:00Z', 'Orçamento aprovado internamente, aguardando assinatura.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('fd7119a2-dab5-49a2-be04-8cec15427143', '9a96d969-c39d-4ab8-bbae-5921f2b3d41e', 'CONTACT', 'Contato pelo site.', date('now','-27 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('9484bd23-9b20-497f-a939-c0c351c46cbd', '9a96d969-c39d-4ab8-bbae-5921f2b3d41e', 'CONTACT', 'Reunião com a diretoria.', date('now','-20 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('69d46205-adce-4505-a671-f5f0d8961b49', '9a96d969-c39d-4ab8-bbae-5921f2b3d41e', 'CONTACT', 'Orçamento enviado — R$ 11.500.', date('now','-9 days') || 'T12:00:00Z');

-- Vanessa Duarte — Salão Beleza Real (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('a4e6a0b0-9a34-4171-b13e-ea2e6dbab01f', 'Vanessa Duarte', '(11) 90000-0013', 'vanessa@exemplo.test', 'Salão Beleza Real (fictício)', 1600, 'PERDIDO', 'Instagram', date('now','-48 days') || 'T12:00:00Z', date('now','-30 days') || 'T12:00:00Z', NULL, 'Fechou com concorrente por preço.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('534701d3-5f99-4907-8a7b-dfd243af3bcb', 'a4e6a0b0-9a34-4171-b13e-ea2e6dbab01f', 'CONTACT', 'Contato pelo Instagram.', date('now','-48 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('00995641-672c-49e7-a223-8b274a4db8b8', 'a4e6a0b0-9a34-4171-b13e-ea2e6dbab01f', 'CONTACT', 'Orçamento enviado — R$ 1.600.', date('now','-40 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('4791b2a8-df3c-4063-aece-447650be5e4d', 'a4e6a0b0-9a34-4171-b13e-ea2e6dbab01f', 'STATUS_CHANGE', 'Status alterado para Perdido — fechou com concorrente.', date('now','-30 days') || 'T12:00:00Z');

-- Gustavo Mendes — Distribuidora Norte Sul (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('b8e585fd-ffe9-4792-beb2-2ca8c5722bf7', 'Gustavo Mendes', '(85) 90000-0014', 'gustavo@exemplo.test', 'Distribuidora Norte Sul (fictícia)', 8700, 'GANHO', 'Indicação', date('now','-52 days') || 'T12:00:00Z', date('now','-10 days') || 'T12:00:00Z', NULL, 'Fechou depois de um follow-up de resgate — exemplo de oportunidade recuperada.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('46241601-e718-4e2a-9914-96e56857c5a2', 'b8e585fd-ffe9-4792-beb2-2ca8c5722bf7', 'CONTACT', 'Contato inicial por indicação.', date('now','-52 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('5d87f6b3-f446-4295-895d-0e5e404323ff', 'b8e585fd-ffe9-4792-beb2-2ca8c5722bf7', 'CONTACT', 'Orçamento enviado — R$ 8.700.', date('now','-45 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('2345ef10-cf73-4561-9ef8-cb629d0c473e', 'b8e585fd-ffe9-4792-beb2-2ca8c5722bf7', 'NOTE', 'Sem resposta do cliente por duas semanas.', date('now','-30 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('cff8bfa6-77a6-4fa6-883b-2ddb100c639d', 'b8e585fd-ffe9-4792-beb2-2ca8c5722bf7', 'FOLLOW_UP', 'Follow-up de resgate enviado pelo FOLLOW.', date('now','-16 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('b9e6010c-adb3-4e8f-92dd-1489e83d065f', 'b8e585fd-ffe9-4792-beb2-2ca8c5722bf7', 'RESPONSE', 'Cliente retomou a conversa e pediu a nota.', date('now','-13 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('05f1cdd3-165b-4940-9068-2e2eedce1ea6', 'b8e585fd-ffe9-4792-beb2-2ca8c5722bf7', 'STATUS_CHANGE', 'Status alterado para Ganho.', date('now','-10 days') || 'T12:00:00Z');

-- Larissa Campos — Café Grão Fino (fictício)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('5a490304-671e-4816-9582-87c10a46c66a', 'Larissa Campos', '(11) 90000-0015', 'larissa@exemplo.test', 'Café Grão Fino (fictício)', 2100, 'GANHO', 'Site', date('now','-33 days') || 'T12:00:00Z', date('now','-18 days') || 'T12:00:00Z', NULL, 'Ciclo curto, fechou sem precisar de follow-up.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('c4c85c99-d2da-4e81-b557-1ab5c4036484', '5a490304-671e-4816-9582-87c10a46c66a', 'CONTACT', 'Contato pelo site.', date('now','-33 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('419d394f-4d39-4c19-a1cd-4faea1feddc3', '5a490304-671e-4816-9582-87c10a46c66a', 'CONTACT', 'Orçamento enviado — R$ 2.100.', date('now','-25 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('9e769473-3114-470b-bc09-b06bf2dcbf75', '5a490304-671e-4816-9582-87c10a46c66a', 'STATUS_CHANGE', 'Status alterado para Ganho.', date('now','-18 days') || 'T12:00:00Z');

-- Diego Ramos — Lavanderia Água Viva (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('64a276a0-759f-4069-b445-a352d1d3d253', 'Diego Ramos', '(11) 90000-0016', 'diego@exemplo.test', 'Lavanderia Água Viva (fictícia)', 3400, 'PERDIDO', 'Telefone', date('now','-70 days') || 'T12:00:00Z', date('now','-45 days') || 'T12:00:00Z', NULL, 'Adiou o projeto por tempo indeterminado.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('aeb91ce7-4c26-4263-9c4e-01f8397f7d35', '64a276a0-759f-4069-b445-a352d1d3d253', 'CONTACT', 'Ligação recebida.', date('now','-70 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('4e63fa40-a92e-4ed2-b79d-07d4d042dad3', '64a276a0-759f-4069-b445-a352d1d3d253', 'CONTACT', 'Orçamento enviado — R$ 3.400.', date('now','-62 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('be09ac04-a9bc-463c-9f1a-cbbd8c6a17f4', '64a276a0-759f-4069-b445-a352d1d3d253', 'STATUS_CHANGE', 'Status alterado para Perdido — projeto adiado.', date('now','-45 days') || 'T12:00:00Z');

-- Sofia Nogueira — Imobiliária Terra Firme (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('f47fe76e-b193-40d2-9a66-a0b3f286480b', 'Sofia Nogueira', '(48) 90000-0017', 'sofia@exemplo.test', 'Imobiliária Terra Firme (fictícia)', 6300, 'ORCAMENTO', 'Site', date('now','-12 days') || 'T12:00:00Z', date('now','-3 days') || 'T12:00:00Z', date('now','-0 days') || 'T12:00:00Z', 'Acabou de entrar na faixa de atenção.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('9609de4c-5765-475c-87e2-5bccd518fdad', 'f47fe76e-b193-40d2-9a66-a0b3f286480b', 'CONTACT', 'Contato pelo site.', date('now','-12 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('1e46889e-8e1d-439a-8f5b-d9cbcc71175e', 'f47fe76e-b193-40d2-9a66-a0b3f286480b', 'CONTACT', 'Orçamento enviado — R$ 6.300.', date('now','-3 days') || 'T12:00:00Z');

-- Henrique Vasconcelos — Metalúrgica Aço Forte (fictícia)
INSERT INTO leads (id, name, phone, email, company, value, status, source, created_at, last_contact_at, next_follow_up_at, notes) VALUES ('b9dfe90e-8eec-4534-af82-c9c4b24a8756', 'Henrique Vasconcelos', '(11) 90000-0018', 'henrique@exemplo.test', 'Metalúrgica Aço Forte (fictícia)', 18900, 'NEGOCIACAO', 'Evento', date('now','-44 days') || 'T12:00:00Z', date('now','-11 days') || 'T12:00:00Z', date('now','-4 days') || 'T12:00:00Z', 'Negociação avançada travada na condição de pagamento.');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('cec0dc5a-8b6b-4e2e-8ee7-563a1ae3b00b', 'b9dfe90e-8eec-4534-af82-c9c4b24a8756', 'CONTACT', 'Contato feito em evento do setor.', date('now','-44 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('eaf62c77-f57d-4eaf-95ea-151ad15418d0', 'b9dfe90e-8eec-4534-af82-c9c4b24a8756', 'CONTACT', 'Proposta enviada — R$ 18.900.', date('now','-36 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('10bc01e2-e5c5-451a-96d1-b56d3b10f912', 'b9dfe90e-8eec-4534-af82-c9c4b24a8756', 'RESPONSE', 'Cliente pediu parcelamento em 6x.', date('now','-22 days') || 'T12:00:00Z');
INSERT INTO history (id, lead_id, type, message, created_at) VALUES ('503a4371-bdc1-4beb-8ffd-e6eb72bbe5ad', 'b9dfe90e-8eec-4534-af82-c9c4b24a8756', 'FOLLOW_UP', 'Enviada condição de pagamento revisada.', date('now','-11 days') || 'T12:00:00Z');

-- Conferência: devem aparecer 18 leads.
SELECT COUNT(*) AS leads FROM leads;
SELECT COUNT(*) AS eventos FROM history;
