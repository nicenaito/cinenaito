import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { HeaderWithAuthData } from '@/components/header'
import { DashboardClient } from './dashboard-client'
import { getCurrentMonth, isValidYearMonth } from '@/lib/helpers'
import { MoviePlanWithStats } from '@/types/database.types'

const DASHBOARD_FETCH_LIMIT = 60

export const metadata: Metadata = {
  title: 'ダッシュボード - CineNaito',
  description: '映画公開予定一覧',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; sort?: string }>
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

  const sortParam = params.sort as 'newest' | 'release_asc' | undefined
  const initialSortBy = sortParam || 'release_asc'

  // 映画予定を取得（release_month または target_month が一致するものを取得）
  const q = supabase
    .from('movie_plans_with_stats')
    .select('*')
    .or(`release_month.eq.${selectedMonth},target_month.eq.${selectedMonth}`)

  if (initialSortBy === 'newest') {
    q.order('created_at', { ascending: false })
  } else {
    q.order('sortable_release_date', { ascending: true, nullsFirst: false })
     .order('created_at', { ascending: false })
  }
  q.limit(DASHBOARD_FETCH_LIMIT)

  // 1. まず映画予定を取得
  const filteredResult = await q

  let plans: MoviePlanWithStats[] = []
  if (filteredResult.error) {
    console.error('データ取得エラー（release_month フィルタ）:', filteredResult.error)
    // release_month / sortable_release_date がビューに存在しない場合のフォールバック
    const fallbackQuery = supabase
      .from('movie_plans_with_stats')
      .select('*')
      .eq('target_month', selectedMonth)
    if (initialSortBy === 'newest') {
      fallbackQuery.order('created_at', { ascending: false })
    } else {
      fallbackQuery
        .order('release_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
    }
    const fallbackResult = await fallbackQuery.limit(DASHBOARD_FETCH_LIMIT)
    if (fallbackResult.error) {
      console.error('データ取得エラー（fallback）:', fallbackResult.error)
      plans = []
    } else {
      plans = (fallbackResult.data as MoviePlanWithStats[] | null) || []
    }
  } else {
    plans = (filteredResult.data as MoviePlanWithStats[] | null) || []
  }

  const planIds = plans.map((p) => p.id)

  // 2. プランに関連するユーザー固有データを並列取得
  const [reactedPlanIdsResult, profileResult] = await Promise.all([
    user && planIds.length > 0
      ? supabase
          .from('reactions')
          .select('plan_id')
          .eq('user_id', user.id)
          .in('plan_id', planIds)
          .returns<{ plan_id: string }[]>()
      : Promise.resolve({ data: [] as { plan_id: string }[] | null }),
    user
      ? supabase
          .from('profiles')
          .select('username, avatar_url, is_admin')
          .eq('id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const reactedPlanIds = new Set(reactedPlanIdsResult.data?.map((r) => r.plan_id) || [])
  const profile = profileResult.data
  const isAdmin = !!profile?.is_admin
  const headerAuthData = user
    ? {
        userId: user.id,
        fullName: user.user_metadata?.full_name ?? null,
        profile: profile || null,
      }
    : null

  return (
    <div className="min-h-screen cinema-bg">
      <HeaderWithAuthData authData={headerAuthData} />
      <main className="container mx-auto px-4 py-8">
        <DashboardClient
          plans={plans}
          selectedMonth={selectedMonth}
          currentUserId={user?.id}
          isAdmin={isAdmin}
          isLoggedIn={!!user}
          reactedPlanIds={Array.from(reactedPlanIds)}
          initialSortBy={initialSortBy}
        />
      </main>
    </div>
  )
}
