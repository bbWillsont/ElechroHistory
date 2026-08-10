-- Акты КС-2 / КС-3 / КС-11 / дефектный
CREATE TABLE acts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id     UUID NOT NULL REFERENCES projects(id),
  estimate_id    UUID REFERENCES estimates(id),
  act_type       act_type NOT NULL,
  act_number     TEXT NOT NULL,
  act_date       DATE NOT NULL,
  amount         NUMERIC(18,2),
  status         TEXT DEFAULT 'draft',
  signed_at      TIMESTAMPTZ,
  signature_data JSONB,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE act_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  act_id           UUID NOT NULL REFERENCES acts(id) ON DELETE CASCADE,
  estimate_item_id UUID REFERENCES estimate_items(id),
  name             TEXT NOT NULL,
  unit             TEXT,
  quantity         NUMERIC(14,4),
  price            NUMERIC(12,2),
  total            NUMERIC(18,2) GENERATED ALWAYS AS (quantity * price) STORED
);

-- Документы (КП, договоры, схемы)
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,
  doc_type    TEXT,
  title       TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  mime_type   TEXT,
  size_bytes  BIGINT,
  uploaded_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Протоколы испытаний (изоляция, заземление, УЗО, фаза-ноль)
CREATE TABLE test_protocols (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES projects(id),
  protocol_type TEXT NOT NULL,
  protocol_no   TEXT,
  test_date     DATE,
  measurements  JSONB NOT NULL,
  conclusion    TEXT,
  performed_by  UUID REFERENCES users(id),
  file_url      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
