-- Статус проекта (Kanban: Проект→Смета→Согласование→Договор→Производство→Сдача→Оплата)
CREATE TYPE project_status AS ENUM (
  'draft','estimate','approval','contract','production','delivery','payment','done','archived'
);

CREATE TYPE estimate_status AS ENUM (
  'draft','in_review','approved','in_progress','closed','rejected'
);

CREATE TYPE act_type AS ENUM ('KS2','KS3','KS11','defect_act','other');

CREATE TYPE vat_mode AS ENUM ('on_top','included','none');

CREATE TYPE member_role AS ENUM (
  'owner','admin','engineer','foreman','brigadier','accountant'
);
