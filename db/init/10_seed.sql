-- ⚠️ Цифры расценок ниже — ДЕМО для тестирования.
-- Реальные значения импортируйте из ФГИС ЦС (fgiscs.minstroyrf.ru).

-- Тестовая организация
INSERT INTO tenants (id, name, legal_form, inn, plan) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ООО ЭлектроМонтаж', 'ООО', '7700000001', 'pro');

-- Тестовый пользователь (пароль: demo123 — замените хэш в production!)
INSERT INTO users (id, email, password_hash, full_name, is_verified) VALUES
  ('22222222-2222-2222-2222-222222222222', 'demo@electro.ru',
   '$2b$10$XyZplaceholderReplaceWithRealBcryptHash', 'Иван Сметчиков', TRUE);

INSERT INTO tenant_members (tenant_id, user_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222', 'owner');

-- Типы нормативов
INSERT INTO catalog_types (code, name, base_year, description) VALUES
  ('FERm',  'Федеральные единичные расценки на монтаж', 2000, 'Сборники на монтаж оборудования'),
  ('GESNm', 'Государственные элементные сметные нормы', 2000, 'Элементные нормы расхода'),
  ('FSSC',  'Федеральные сметные цены на ресурсы',      2000, 'Цены на материалы и оборудование');

-- Демо-расценки ФЕРм, сборник 8 "Электротехнические установки"
INSERT INTO rates (catalog_id, code, name, unit, ozp_base, emm_base, mat_base, labor_hours, worker_grade, nr_rate, sp_rate) VALUES
  (1, '08-02-134-01', 'Прокладка кабеля в готовых каналах, масса до 1 кг/м', '100 м', 185.00, 42.10, 12.50, 22.4, 3.5, 95.0, 60.0),
  (1, '08-02-140-01', 'Прокладка проводов в трубах, сечение до 2,5 мм2', '100 м', 210.50, 18.30, 8.20, 25.8, 3.2, 95.0, 60.0),
  (1, '08-02-147-01', 'Установка розеток и выключателей', '100 шт', 320.00, 15.60, 5.40, 38.2, 3.0, 95.0, 60.0),
  (1, '08-02-156-01', 'Монтаж светильников потолочных', '100 шт', 480.00, 65.20, 22.10, 55.0, 3.4, 95.0, 60.0),
  (1, '08-03-012-01', 'Установка щитов освещения до 25 групп', 'шт', 640.00, 88.40, 35.70, 72.5, 4.0, 95.0, 60.0),
  (1, '08-01-031-01', 'Контур заземления из полосовой стали', 'т', 950.00, 320.00, 45.00, 110.0, 3.8, 95.0, 60.0);

-- Демо-материалы
INSERT INTO materials (tenant_id, name, category, unit, base_price, specs) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Кабель ВВГнг-LS 3x2,5', 'cable', 'м', 85.00, '{"cross_section":"2.5","cores":3}'),
  ('11111111-1111-1111-1111-111111111111', 'Кабель ВВГнг-LS 3x1,5', 'cable', 'м', 62.00, '{"cross_section":"1.5","cores":3}'),
  ('11111111-1111-1111-1111-111111111111', 'Гофра ПВХ d20', 'pipe', 'м', 18.00, '{"diameter":20}'),
  ('11111111-1111-1111-1111-111111111111', 'Розетка Schneider AtlasDesign', 'socket', 'шт', 320.00, '{"type":"schuko"}'),
  ('11111111-1111-1111-1111-111111111111', 'Щит ЩРН-24', 'panel', 'шт', 2800.00, '{"modules":24}');

-- Демо-клиент и проект
INSERT INTO clients (tenant_id, name, legal_type, phone, email, address) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ООО Ромашка', 'yur', '+74951234567', 'info@romashka.ru', 'г. Москва, ул. Ленина, 1');

INSERT INTO projects (tenant_id, client_id, name, object_type, address, status, budget, date_start, date_end) VALUES
  ('11111111-1111-1111-1111-111111111111',
   (SELECT id FROM clients WHERE name='ООО Ромашка' LIMIT 1),
   'Электромонтаж офиса 200 м2', 'office', 'г. Москва, ул. Ленина, 1',
   'estimate', 850000.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days');

-- Демо-смета (итоговые поля пересчитаются триггером)
INSERT INTO estimates (tenant_id, project_id, name, status, vat_rate, vat_mode) VALUES
  ('11111111-1111-1111-1111-111111111111',
   (SELECT id FROM projects WHERE name='Электромонтаж офиса 200 м2' LIMIT 1),
   'Локальная смета №1 (силовые сети и освещение)', 'draft', 20, 'on_top');

INSERT INTO estimate_items (estimate_id, code, name, unit, quantity, price_ozp, price_emm, price_mat, nr_rate, sp_rate, position)
SELECT
  e.id, r.code, r.name, r.unit,
  CASE r.code WHEN '08-02-134-01' THEN 3.5 ELSE 2.0 END,
  r.ozp_base * 8.5, r.emm_base * 8.5, r.mat_base * 8.5,
  r.nr_rate, r.sp_rate, ROW_NUMBER() OVER (ORDER BY r.code)
FROM estimates e
JOIN rates r ON r.catalog_id = 1 AND r.code IN ('08-02-134-01','08-02-140-01','08-02-147-01')
WHERE e.name = 'Локальная смета №1 (силовые сети и освещение)';
