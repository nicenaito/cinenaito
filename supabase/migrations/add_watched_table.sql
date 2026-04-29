-- ===================================================
-- マイグレーション: watched（鑑賞済み）テーブル追加
-- 適用対象: Supabase SQL Editor
-- ===================================================

-- 1. watched テーブル作成
CREATE TABLE IF NOT EXISTS watched (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES movie_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(plan_id, user_id)
);

-- 2. インデックス
CREATE INDEX IF NOT EXISTS watched_plan_id_idx ON watched(plan_id);
CREATE INDEX IF NOT EXISTS watched_user_id_idx ON watched(user_id);

-- 3. RLS
ALTER TABLE watched ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view all watched"
  ON watched FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create watched"
  ON watched FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watched"
  ON watched FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all watched"
  ON watched FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- 4. ビュー更新（watched_count と watched_users を追加）
CREATE OR REPLACE VIEW movie_plans_with_stats AS
SELECT
  mp.*,
  p.username,
  p.avatar_url,
  COALESCE(r.reaction_count, 0) AS reaction_count,
  COALESCE(c.comment_count, 0) AS comment_count,
  COALESCE(w.watched_count, 0) AS watched_count,
  COALESCE(w.watched_users, '[]'::jsonb) AS watched_users
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
) c ON mp.id = c.plan_id
LEFT JOIN (
  SELECT
    w.plan_id,
    COUNT(*) AS watched_count,
    jsonb_agg(
      jsonb_build_object(
        'user_id', w.user_id,
        'username', wp.username,
        'avatar_url', wp.avatar_url
      )
    ) AS watched_users
  FROM watched w
  LEFT JOIN profiles wp ON w.user_id = wp.id
  GROUP BY w.plan_id
) w ON mp.id = w.plan_id;
