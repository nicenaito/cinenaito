-- profiles テーブルに view_mode カラムを追加
-- ダッシュボードの表示モード（card / list）をユーザーごとに保持
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS view_mode TEXT NOT NULL DEFAULT 'card';
