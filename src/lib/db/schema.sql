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
