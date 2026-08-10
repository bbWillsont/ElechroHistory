-- Автопересчёт итогов сметы при изменении позиций.
-- НР и СП начисляются на ОЗП (фонд оплаты труда) согласно методике.
CREATE OR REPLACE FUNCTION recalc_estimate_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_estimate_id UUID;
BEGIN
  v_estimate_id := COALESCE(NEW.estimate_id, OLD.estimate_id);

  UPDATE estimates e SET
    total_ozp        = s.s_ozp,
    total_emm        = s.s_emm,
    total_mat        = s.s_mat,
    total_direct     = s.s_direct,
    total_nr         = s.s_nr,
    total_sp         = s.s_sp,
    total_before_vat = s.s_direct + s.s_nr + s.s_sp,
    total_vat        = CASE
                         WHEN e.vat_mode = 'none' THEN 0
                         WHEN e.vat_mode = 'on_top'
                           THEN (s.s_direct + s.s_nr + s.s_sp) * e.vat_rate / 100
                         WHEN e.vat_mode = 'included'
                           THEN (s.s_direct + s.s_nr + s.s_sp) * e.vat_rate / (100 + e.vat_rate)
                       END,
    grand_total      = CASE
                         WHEN e.vat_mode = 'on_top'
                           THEN (s.s_direct + s.s_nr + s.s_sp) * (1 + e.vat_rate / 100)
                         ELSE s.s_direct + s.s_nr + s.s_sp
                       END,
    updated_at       = now()
  FROM (
    SELECT
      COALESCE(SUM(sum_ozp), 0)                                    AS s_ozp,
      COALESCE(SUM(sum_emm), 0)                                    AS s_emm,
      COALESCE(SUM(sum_mat), 0)                                    AS s_mat,
      COALESCE(SUM(sum_direct), 0)                                 AS s_direct,
      COALESCE(SUM(sum_ozp * COALESCE(nr_rate, 0) / 100), 0)       AS s_nr,
      COALESCE(SUM(sum_ozp * COALESCE(sp_rate, 0) / 100), 0)       AS s_sp
    FROM estimate_items
    WHERE estimate_id = v_estimate_id
  ) s
  WHERE e.id = v_estimate_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_estimate
AFTER INSERT OR UPDATE OR DELETE ON estimate_items
FOR EACH ROW EXECUTE FUNCTION recalc_estimate_totals();

-- Автообновление updated_at на проектах
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_touch
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
