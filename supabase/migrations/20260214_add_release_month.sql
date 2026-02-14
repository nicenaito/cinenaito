ALTER TABLE public.movie_plans
ADD COLUMN IF NOT EXISTS release_month TEXT;

UPDATE public.movie_plans
SET release_month = CASE
  WHEN release_date ~ '^\d{4}-\d{2}-\d{2}$' THEN substring(release_date from 1 for 7)
  WHEN release_date ~ '^\d{4}-\d{2}$' THEN release_date
  WHEN release_date ~ '^\d{4}/\d{1,2}(/\d{1,2})?$' THEN
    split_part(release_date, '/', 1) || '-' || lpad(split_part(release_date, '/', 2), 2, '0')
  WHEN release_date ~ '^\d{4}年\s*\d{1,2}月\s*\d{1,2}日$' THEN
    substring(release_date from '(\d{4})年') || '-' || lpad(substring(release_date from '年\s*(\d{1,2})月'), 2, '0')
  WHEN release_date ~ '^\d{4}年\s*\d{1,2}月$' THEN
    substring(release_date from '(\d{4})年') || '-' || lpad(substring(release_date from '年\s*(\d{1,2})月'), 2, '0')
  ELSE target_month
END
WHERE release_month IS NULL;

CREATE INDEX IF NOT EXISTS movie_plans_release_month_idx
  ON public.movie_plans(release_month);
