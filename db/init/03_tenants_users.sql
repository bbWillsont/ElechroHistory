-- Организация (tenant) — корень мультитенантности
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  legal_form    TEXT,
  inn           TEXT,
  kpp           TEXT,
  bank_details  JSONB DEFAULT '{}',
  logo_url      TEXT,
  plan          TEXT DEFAULT 'free',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  avatar_url    TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tenant_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        member_role NOT NULL DEFAULT 'engineer',
  invited_by  UUID REFERENCES users(id),
  joined_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);
