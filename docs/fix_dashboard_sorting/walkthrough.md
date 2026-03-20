# 修正内容の確認

1. **`src/app/dashboard/page.tsx`**
   - サーバーコンポーネントで `searchParams.sort` を受け取るように型を拡張しました。
   - 受け取ったソート条件 (`initialSortBy`) を判定し、Supabase の `.from('movie_plans_with_stats')` に対する `.order()` の指定を動的に切り替えるように修正しました。
   - `DashboardClient` に `initialSortBy` prop を渡すようにしました。

2. **`src/app/dashboard/dashboard-client.tsx`**
   - `DashboardClientProps` に `initialSortBy` を追加し、`useState` の初期値として設定しました。
   - 月変更時や並び替え変更時に、`router.push` を使って URL に `?month=...&sort=...` を付与し、サーバーサイドとのソート状態の同期を実現しました。これにより、リロードや共有時にも並び順が維持されるようになります。