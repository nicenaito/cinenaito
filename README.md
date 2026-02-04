# CineNaito

月ごとに鑑賞予定の映画を共有し、ユーザー間でリアクションやコメントができるソーシャルサービス。

## 主な機能

- **Discord認証**: Discord SSOでログイン
- **映画予定投稿**: タイトル、映画.com URL、YouTube予告編URL、コメントを登録
- **期待度バッジ**: 「絶対観る」「時間が合えば」「気にはなっている」
- **月別フィルタ**: 対象月で一覧を絞り込み
- **リアクション**: 「自分も観る」を1ユーザー1投稿で表現
- **コメント**: 投稿に対するコメントと削除

## 技術スタック

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide React
- **Backend/BaaS**: Supabase (Auth, Database, RLS)
- **Deployment**: Vercel

## クイックスタート

```bash
npm install
cp .env.example .env.local
# .env.local に Supabase のURL/キーを設定
npm run dev
```

## 環境変数

| 変数名 | 説明 |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Supabase プロジェクトURL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 匿名キー |

## セットアップ手順

### 1) Supabase プロジェクト

1. Supabase Dashboard でプロジェクト作成
2. SQL Editor で [supabase/schema.sql](supabase/schema.sql) を実行
3. Authentication > Providers で Discord を有効化
4. Project Settings から URL と anon key を取得

### 2) Discord OAuth

1. Discord Developer Portal でアプリ作成
2. OAuth2 で Client ID / Secret を取得
3. Redirects に `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback` を追加
4. Supabase 側で Discord Provider に Client ID / Secret を設定

### 3) Vercel デプロイ

1. GitHub にリポジトリをプッシュ
2. Vercel でインポート
3. 環境変数を設定: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Supabase > Authentication > URL Configuration に本番URLを追加

## 管理者ユーザー

`profiles.is_admin` が `true` のユーザーは、投稿・コメントを削除できます。

### 管理者昇格（UI）

管理者ユーザーは /admin/users で一般ユーザーを管理者にできます。

例: Supabase SQL Editor で管理者に昇格

```sql
UPDATE profiles
SET is_admin = true
WHERE id = 'YOUR_USER_ID';
```

## データベース構造

| テーブル | 説明 |
| --- | --- |
| profiles | ユーザープロフィール（Discord連携） |
| movie_plans | 映画鑑賞予定（メイン投稿） |
| plan_comments | 投稿へのコメント |
| reactions | 「自分も観る」リアクション |

### 期待度 (Enum)

- 絶対観る
- 時間が合えば
- 気にはなっている

## 開発コマンド

```bash
npm run dev
npm run build
npm run start
```

## ライセンス

MIT
