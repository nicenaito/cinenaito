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

  const sortParam = params.sort as 'reaction_desc' | 'newest' | 'release_asc' | undefined
  const initialSortBy = sortParam || 'reaction_desc'

  // 映画予定を取得
  const baseQuery = () => {
    let q = supabase.from('movie_plans_with_stats').select('*').limit(DASHBOARD_FETCH_LIMIT)
    
    if (initialSortBy === 'newest') {
      q = q.order('created_at', { ascending: false })
    } else if (initialSortBy === 'release_asc') {
      q = q.order('release_month', { ascending: true, nullsFirst: false })
           .order('target_month', { ascending: true })
           .order('created_at', { ascending: false })
    } else {
      q = q.order('reaction_count', { ascending: false })
           .order('created_at', { ascending: false })
    }
    return q
  }

  const [filteredResult, reactedPlanIdsResult, profileResult] = await Promise.all([
    baseQuery().or(
      `release_month.eq.${selectedMonth},and(release_month.is.null,target_month.eq.${selectedMonth})`
    ),
    user
      ? supabase
          .from('reactions')
          .select('plan_id')
          .eq('user_id', user.id)
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
