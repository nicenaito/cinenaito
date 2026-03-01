-- comment_reactions テーブル追加
-- 各コメントへの複数絵文字リアクション対応

CREATE TABLE comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES plan_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(comment_id, user_id, emoji)
);

CREATE INDEX comment_reactions_comment_id_idx ON comment_reactions(comment_id);
CREATE INDEX comment_reactions_user_id_idx ON comment_reactions(user_id);

ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view all comment reactions"
  ON comment_reactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comment reactions"
  ON comment_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment reactions"
  ON comment_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
