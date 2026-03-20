# 実装計画

1. **サーバーサイドのソート対応 (`src/app/dashboard/page.tsx`)**
   - URLパラメータ (`searchParams.sort`) を受け取る。
   - クエリパラメータの値 (`newest`, `release_asc`, `reaction_desc`) に応じて Supabase クエリの `.order()` を切り替える。
   - `release_date` は文字列のため正確なソートが難しいが、`release_month` での大まかなソートを適用しつつ、細かいソートは既存のクライアントサイドロジックで行うよう組み合わせる。

2. **クライアントコンポーネントの改修 (`src/app/dashboard/dashboard-client.tsx`)**
   - `DashboardClientProps` に `initialSortBy` を追加。
   - `useState` の初期値に `initialSortBy` を使用。
   - 並び替えの Select ボックス変更時に、`router.push` で `month` パラメータと併せて `sort` パラメータ付きの URL に遷移させ、状態を同期させる。