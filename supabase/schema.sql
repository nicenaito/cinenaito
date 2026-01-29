-- ===========================================
-- 映画鑑賞予定共有アプリ - データベーススキーマ
-- ===========================================

-- 期待度 Enum型
CREATE TYPE expectation_level AS ENUM (
  '絶対観る',
  '時間が合えば',
  '気にはなっている'
);

-- ===========================================
-- 1. profiles テーブル
-- ユーザープロフィール（Discord連携）
-- ===========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  discord_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- プロフィール更新時のタイムスタンプ自動更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS ポリシー: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは全プロフィールを閲覧可能
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- 自分のプロフィールのみ編集可能
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 新規ユーザー作成時に自動的にプロフィール作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, discord_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'ユーザー'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'provider_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- 2. movie_plans テーブル
-- 映画鑑賞予定（メイン投稿）
-- ===========================================
CREATE TABLE movie_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  movie_url TEXT, -- 映画.com URL
  youtube_url TEXT, -- YouTube予告編URL
  comment TEXT,
  expectation expectation_level NOT NULL DEFAULT '気にはなっている',
  target_month TEXT NOT NULL, -- YYYY-MM形式
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- インデックス
CREATE INDEX movie_plans_user_id_idx ON movie_plans(user_id);
CREATE INDEX movie_plans_target_month_idx ON movie_plans(target_month);

CREATE TRIGGER movie_plans_updated_at
  BEFORE UPDATE ON movie_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS ポリシー: movie_plans
ALTER TABLE movie_plans ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは全投稿を閲覧可能
CREATE POLICY "Authenticated users can view all movie plans"
  ON movie_plans FOR SELECT
  TO authenticated
  USING (true);

-- 自分の投稿のみ作成可能
CREATE POLICY "Users can create own movie plans"
  ON movie_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 自分の投稿のみ編集可能
CREATE POLICY "Users can update own movie plans"
  ON movie_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 自分の投稿のみ削除可能
CREATE POLICY "Users can delete own movie plans"
  ON movie_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===========================================
-- 3. plan_comments テーブル
-- 投稿に対するコメント
-- ===========================================
CREATE TABLE plan_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES movie_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- インデックス
CREATE INDEX plan_comments_plan_id_idx ON plan_comments(plan_id);
CREATE INDEX plan_comments_user_id_idx ON plan_comments(user_id);

CREATE TRIGGER plan_comments_updated_at
  BEFORE UPDATE ON plan_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS ポリシー: plan_comments
ALTER TABLE plan_comments ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは全コメントを閲覧可能
CREATE POLICY "Authenticated users can view all comments"
  ON plan_comments FOR SELECT
  TO authenticated
  USING (true);

-- 認証済みユーザーはコメント作成可能
CREATE POLICY "Authenticated users can create comments"
  ON plan_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 自分のコメントのみ編集可能
CREATE POLICY "Users can update own comments"
  ON plan_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 自分のコメントのみ削除可能
CREATE POLICY "Users can delete own comments"
  ON plan_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===========================================
-- 4. reactions テーブル
-- 「自分も鑑賞予定」リアクション
-- ===========================================
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES movie_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- 1ユーザー1投稿1回まで
  UNIQUE(plan_id, user_id)
);

-- インデックス
CREATE INDEX reactions_plan_id_idx ON reactions(plan_id);
CREATE INDEX reactions_user_id_idx ON reactions(user_id);

-- RLS ポリシー: reactions
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは全リアクションを閲覧可能
CREATE POLICY "Authenticated users can view all reactions"
  ON reactions FOR SELECT
  TO authenticated
  USING (true);

-- 認証済みユーザーはリアクション作成可能
CREATE POLICY "Authenticated users can create reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 自分のリアクションのみ削除可能
CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===========================================
-- ビュー: 投稿詳細（リアクション数・コメント数含む）
-- ===========================================
CREATE OR REPLACE VIEW movie_plans_with_stats AS
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
