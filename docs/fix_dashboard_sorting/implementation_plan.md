# 実装計画

1. **サーバーサイドのクエリ修正 (`src/app/dashboard/page.tsx`)**
   - URLパラメータ (`sort`) を取得し、デフォルトを `release_asc` に設定。
   - Supabase クエリにおいて、月フィルタ (`.or()`) を **先に適用してから** ソート (`.order()`) とリミット (`.limit()`) を行うよう変更。これにより、他月の投稿が多い場合でも当該月のデータが欠損するのを防ぐ。
   - `reaction_desc` (リアクション数順) の処理を削除し、`release_asc` と `newest` の2種に対応。

2. **クライアントコンポーネントの調整 (`src/app/dashboard/dashboard-client.tsx`)**
   - `SortOption` 型から `reaction_desc` を削除。
   - `initialSortBy` のデフォルトを `release_asc` に変更。
   - `Select` の選択肢を「公開日順」と「投稿順」に簡略化。
   - クライアントサイドでのソートロジックからも `reaction_desc` のケースを削除。