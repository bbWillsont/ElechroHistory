-- Типы нормативов (ФЕРм, ГЭСНм, ФССЦ, ТСН)
CREATE TABLE catalog_types (
  id          SERIAL PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  base_year   INT,
  description TEXT
);

-- Расценки ФЕРм / ГЭСНм
CREATE TABLE rates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  catalog_id      INT NOT NULL REFERENCES catalog_types(id),
  code            TEXT NOT NULL,
  name            TEXT NOT NULL,
  unit            TEXT NOT NULL,
  ozp_base        NUMERIC(12,2) DEFAULT 0,   -- ОЗП (базис)
  emm_base        NUMERIC(12,2) DEFAULT 0,   -- ЭММ (базис)
  mat_base        NUMERIC(12,2) DEFAULT 0,   -- МАТ (базис)
  labor_hours     NUMERIC(8,2),
  worker_grade    NUMERIC(4,1),
  nr_rate         NUMERIC(5,2),              -- % НР (Постановление №145)
  sp_rate         NUMERIC(5,2),              -- % СП
  is_active       BOOLEAN DEFAULT TRUE,
  UNIQUE (catalog_id, code)
);

CREATE INDEX idx_rates_name_trgm ON rates USING GIN (name gin_trgm_ops);
CREATE INDEX idx_rates_code ON rates (code text_pattern_ops);

-- Материалы (ФССЦ + пользовательские)
CREATE TABLE materials (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID REFERENCES tenants(id) ON DELETE CASCADE,
  fssc_code    TEXT,
  name         TEXT NOT NULL,
  category     TEXT,
  unit         TEXT NOT NULL,
  specs        JSONB DEFAULT '{}',
  base_price   NUMERIC(12,2),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_materials_name_trgm ON materials USING GIN (name gin_trgm_ops);

-- Поставщики и их цены
CREATE TABLE suppliers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  inn         TEXT,
  phone       TEXT,
  email       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE supplier_prices (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id  UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  material_id  UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  price        NUMERIC(12,2) NOT NULL,
  currency     TEXT DEFAULT 'RUB',
  valid_from   DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to     DATE,
  UNIQUE (supplier_id, material_id, valid_from)
);

-- Индексы-дефляторы (базис → текущие цены)
CREATE TABLE price_indices (
  id          SERIAL PRIMARY KEY,
  catalog_id  INT REFERENCES catalog_types(id),
  year        INT NOT NULL,
  quarter     INT NOT NULL,
  index_value NUMERIC(8,4) NOT NULL,
  UNIQUE (catalog_id, year, quarter)
);

-- Клиенты (заказчики)
CREATE TABLE clients (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  legal_type   TEXT,
  inn          TEXT,
  phone        TEXT,
  email        TEXT,
  address      TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);
