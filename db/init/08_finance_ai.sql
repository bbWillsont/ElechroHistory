CREATE TABLE payments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount       NUMERIC(18,2) NOT NULL,
  payment_date DATE,
  payment_type TEXT DEFAULT 'incoming',
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE expenses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES projects(id),
  category     TEXT,
  amount       NUMERIC(18,2) NOT NULL,
  expense_date DATE NOT NULL,
  description  TEXT,
  receipt_url  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- AI-подсказки (аудит + обучение)
CREATE TABLE ai_suggestions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id),
  user_id      UUID REFERENCES users(id),
  request_type TEXT NOT NULL,
  user_input   TEXT NOT NULL,
  ai_response  JSONB NOT NULL,
  was_accepted BOOLEAN,
  feedback     TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Общий аудит
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  tenant_id   UUID,
  user_id     UUID,
  entity_type TEXT,
  entity_id   UUID,
  action      TEXT,
  details     JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_tenant_time ON audit_log (tenant_id, created_at DESC);
