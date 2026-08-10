CREATE TABLE projects (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id      UUID REFERENCES clients(id),
  name           TEXT NOT NULL,
  object_type    TEXT,
  address        TEXT,
  contract_no    TEXT,
  contract_date  DATE,
  status         project_status DEFAULT 'draft',
  priority       INT DEFAULT 3,
  budget         NUMERIC(18,2),
  date_start     DATE,
  date_end       DATE,
  responsible_id UUID REFERENCES users(id),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_tenant_status ON projects (tenant_id, status);

CREATE TABLE work_crews (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  brigadeir_id   UUID REFERENCES users(id),
  specialization TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  crew_id      UUID REFERENCES work_crews(id),
  assignee_id  UUID REFERENCES users(id),
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT DEFAULT 'todo',
  priority     INT DEFAULT 3,
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  position     INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id       UUID REFERENCES tasks(id),
  file_url      TEXT NOT NULL,
  thumbnail_url TEXT,
  geo_lat       NUMERIC(10,7),
  geo_lon       NUMERIC(10,7),
  comment       TEXT,
  taken_at      TIMESTAMPTZ,
  uploaded_by   UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE timesheets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  work_date   DATE NOT NULL,
  hours       NUMERIC(5,2) NOT NULL,
  hourly_rate NUMERIC(10,2),
  status      TEXT DEFAULT 'submitted',
  comment     TEXT,
  UNIQUE (tenant_id, user_id, work_date)
);
