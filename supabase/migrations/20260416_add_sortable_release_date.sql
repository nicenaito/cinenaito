-- sortable_release_date: release_date を YYYY-MM-DD 形式に変換した列
-- サーバー側で公開日順ソートを正しく行うために使用
ALTER TABLE public.movie_plans
ADD COLUMN IF NOT EXISTS sortable_release_date TEXT;

-- 既存データのバックフィル（release_date の形式に応じて変換）
UPDATE public.movie_plans
SET sortable_release_date = CASE
  WHEN release_date ~ '^\d{4}-\d{2}-\d{2}$' THEN release_date
  WHEN release_date ~ '^\d{4}-\d{2}$' THEN release_date || '-01'
  WHEN release_date ~ '^\d{4}/\d{1,2}(/\d{1,2})?$' THEN
    split_part(release_date, '/', 1) || '-' ||
    lpad(split_part(release_date, '/', 2), 2, '0') || '-' ||
    CASE
      WHEN release_date ~ '^\d{4}/\d{1,2}/\d{1,2}$'
        THEN lpad(split_part(release_date, '/', 3), 2, '0')
      ELSE '01'
    END
  WHEN release_date ~ '\d{4}年\s*\d{1,2}月\s*\d{1,2}日' THEN
    substring(release_date from '(\d{4})年') || '-' ||
    lpad(substring(release_date from '年\s*(\d{1,2})月'), 2, '0') || '-' ||
    lpad(substring(release_date from '月\s*(\d{1,2})日'), 2, '0')
  WHEN release_date ~ '\d{4}年\s*\d{1,2}月' THEN
    substring(release_date from '(\d{4})年') || '-' ||
    lpad(substring(release_date from '年\s*(\d{1,2})月'), 2, '0') || '-01'
  ELSE NULL
END
WHERE sortable_release_date IS NULL AND release_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS movie_plans_sortable_release_date_idx
  ON public.movie_plans(sortable_release_date);

-- ビューを再作成（新カラムを含めるため DROP → CREATE で列定義を更新）
DROP VIEW IF EXISTS movie_plans_with_stats;
CREATE VIEW movie_plans_with_stats AS
SELECT
  mp.*,
  p.username,
  p.avatar_url,
  COALESCE(r.reaction_count, 0) AS reaction_count,
  COALESCE(c.comment_count, 0) AS comment_count
FROM movie_plans mp
LEFT JOIN profiles p ON mp.user_id = p.id
LEFT JOIN (
  SELECT plan_id, COUNT(*) AS reaction_count
  FROM reactions
  GROUP BY plan_id
) r ON mp.id = r.plan_id
LEFT JOIN (
  SELECT plan_id, COUNT(*) AS comment_count
  FROM plan_comments
  GROUP BY plan_id
) c ON mp.id = c.plan_id;
