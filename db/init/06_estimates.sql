-- Смета
CREATE TABLE estimates (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  estimate_type    TEXT DEFAULT 'local',
  status           estimate_status DEFAULT 'draft',
  complexity_factor NUMERIC(4,2) DEFAULT 1.0,
  urgency_factor    NUMERIC(4,2) DEFAULT 1.0,
  vat_rate         NUMERIC(5,2) DEFAULT 20,
  vat_mode         vat_mode DEFAULT 'on_top',
  total_ozp        NUMERIC(18,2) DEFAULT 0,
  total_emm        NUMERIC(18,2) DEFAULT 0,
  total_mat        NUMERIC(18,2) DEFAULT 0,
  total_direct     NUMERIC(18,2) DEFAULT 0,
  total_nr         NUMERIC(18,2) DEFAULT 0,
  total_sp         NUMERIC(18,2) DEFAULT 0,
  total_before_vat NUMERIC(18,2) DEFAULT 0,
  total_vat        NUMERIC(18,2) DEFAULT 0,
  grand_total      NUMERIC(18,2) DEFAULT 0,
  valid_until      DATE,
  notes            TEXT,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_estimates_project ON estimates (project_id);
CREATE INDEX idx_estimates_tenant_status ON estimates (tenant_id, status);

CREATE TABLE estimate_sections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  position    INT DEFAULT 0
);

-- Позиция сметы
CREATE TABLE estimate_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  section_id  UUID REFERENCES estimate_sections(id) ON DELETE SET NULL,
  rate_id     UUID REFERENCES rates(id),
  material_id UUID REFERENCES materials(id),
  code        TEXT,
  name        TEXT NOT NULL,
  unit        TEXT NOT NULL,
  quantity    NUMERIC(14,4) NOT NULL,
  price_ozp   NUMERIC(12,2) DEFAULT 0,
  price_emm   NUMERIC(12,2) DEFAULT 0,
  price_mat   NUMERIC(12,2) DEFAULT 0,
  price_index NUMERIC(8,4) DEFAULT 1,
  nr_rate     NUMERIC(5,2),
  sp_rate     NUMERIC(5,2),
  sum_ozp     NUMERIC(18,2) GENERATED ALWAYS AS (price_ozp * quantity) STORED,
  sum_emm     NUMERIC(18,2) GENERATED ALWAYS AS (price_emm * quantity) STORED,
  sum_mat     NUMERIC(18,2) GENERATED ALWAYS AS (price_mat * quantity) STORED,
  sum_direct  NUMERIC(18,2) GENERATED ALWAYS AS ((price_ozp + price_emm + price_mat) * quantity) STORED,
  position    INT DEFAULT 0,
  comment     TEXT
);

CREATE INDEX idx_items_estimate ON estimate_items (estimate_id, position);

-- Версии смет (diff-режим)
CREATE TABLE estimate_versions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  version_no  INT NOT NULL,
  snapshot    JSONB NOT NULL,
  comment     TEXT,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (estimate_id, version_no)
);

-- История изменений
CREATE TABLE estimate_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,
  field       TEXT,
  old_value   TEXT,
  new_value   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
