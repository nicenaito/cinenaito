import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { DashboardClient } from './dashboard-client'
import { getIsAdmin } from '@/lib/admin'

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

  if (!user) {
    redirect('/login')
  }

  const isAdmin = await getIsAdmin(supabase, user.id)

  const params = await searchParams
  const selectedMonth = params.month || 'all'

  // 映画予定を取得
  let query = supabase
    .from('movie_plans_with_stats')
    .select('*')
    .order('created_at', { ascending: false })

  if (selectedMonth !== 'all') {
    query = query.eq('target_month', selectedMonth)
  }

  const { data: plans, error } = await query

  if (error) {
    console.error('データ取得エラー:', error)
  }

  // ユーザーのリアクション状態を取得
  const { data: userReactions } = await supabase
    .from('reactions')
    .select('plan_id')
    .eq('user_id', user.id)
    .returns<{ plan_id: string }[]>()

  const reactedPlanIds = new Set(userReactions?.map((r) => r.plan_id) || [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DashboardClient
          plans={plans || []}
          selectedMonth={selectedMonth}
          currentUserId={user.id}
          isAdmin={isAdmin}
          reactedPlanIds={Array.from(reactedPlanIds)}
        />
      </main>
    </div>
  )
}
