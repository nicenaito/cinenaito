import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { DashboardClient } from './dashboard-client'
import { getIsAdmin } from '@/lib/admin'
import { getCurrentMonth, isValidYearMonth } from '@/lib/helpers'
import { MoviePlanWithStats } from '@/types/database.types'

export const metadata: Metadata = {
  title: 'ダッシュボード - CineNaito',
  description: '映画鑑賞予定一覧',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const supabase = await createClient()

  // ユーザー情報と検索パラメータを並列取得
  const [{ data: { user } }, params] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ])

  const monthParam = params.month
  const selectedMonth = monthParam && isValidYearMonth(monthParam)
    ? monthParam
    : getCurrentMonth()

  // 映画予定・管理者判定・リアクション状態を並列取得
  const baseQuery = () =>
    supabase
      .from('movie_plans_with_stats')
      .select('*')
      .order('reaction_count', { ascending: false })
      .order('created_at', { ascending: false })

  const [filteredResult, isAdmin, reactedPlanIds] = await Promise.all([
    baseQuery().or(
      `release_month.eq.${selectedMonth},and(release_month.is.null,target_month.eq.${selectedMonth})`
    ),
    user ? getIsAdmin(supabase, user.id) : Promise.resolve(false),
    user
      ? supabase
          .from('reactions')
          .select('plan_id')
          .eq('user_id', user.id)
          .returns<{ plan_id: string }[]>()
          .then(({ data }) => new Set(data?.map((r) => r.plan_id) || []))
      : Promise.resolve(new Set<string>()),
  ])

  let plans: MoviePlanWithStats[] = []
  if (filteredResult.error) {
    console.error('データ取得エラー（release_month フィルタ）:', filteredResult.error)
    const fallbackResult = await baseQuery().eq('target_month', selectedMonth)
    if (fallbackResult.error) {
      console.error('データ取得エラー（fallback）:', fallbackResult.error)
      plans = []
    } else {
      plans = (fallbackResult.data as MoviePlanWithStats[] | null) || []
    }
  } else {
    plans = (filteredResult.data as MoviePlanWithStats[] | null) || []
  }

  return (
    <div className="min-h-screen cinema-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DashboardClient
          plans={plans}
          selectedMonth={selectedMonth}
          currentUserId={user?.id}
          isAdmin={isAdmin}
          isLoggedIn={!!user}
          reactedPlanIds={Array.from(reactedPlanIds)}
        />
      </main>
    </div>
  )
}
