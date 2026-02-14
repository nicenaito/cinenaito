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
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user ? await getIsAdmin(supabase, user.id) : false

  const params = await searchParams
  const monthParam = params.month
  const selectedMonth = monthParam && isValidYearMonth(monthParam)
    ? monthParam
    : getCurrentMonth()

  // 映画予定を取得（release_month が未反映な環境ではフォールバック）
  let plans: MoviePlanWithStats[] = []
  const baseQuery = () =>
    supabase
      .from('movie_plans_with_stats')
      .select('*')
      .order('reaction_count', { ascending: false })
      .order('created_at', { ascending: false })

  const filteredResult = await baseQuery().or(
    `release_month.eq.${selectedMonth},and(release_month.is.null,target_month.eq.${selectedMonth})`
  )

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

  // ユーザーのリアクション状態を取得
  let reactedPlanIds = new Set<string>()
  if (user) {
    const { data: userReactions } = await supabase
      .from('reactions')
      .select('plan_id')
      .eq('user_id', user.id)
      .returns<{ plan_id: string }[]>()

    reactedPlanIds = new Set(userReactions?.map((r) => r.plan_id) || [])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
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
