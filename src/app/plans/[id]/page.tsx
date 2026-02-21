import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { YouTubeEmbed } from '@/components/youtube-embed'
import { ExpectationBadge } from '@/components/expectation-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react'
import { formatRelativeTime, formatMonth } from '@/lib/helpers'
import { PlanDetailClient } from './plan-detail-client'
import { deleteMoviePlan } from '@/app/actions'
import { ExpectationLevel } from '@/types/database.types'
import { getIsAdmin } from '@/lib/admin'

interface MoviePlanWithProfile {
  id: string
  user_id: string
  title: string
  release_date: string | null
  movie_url: string | null
  youtube_url: string | null
  comment: string | null
  expectation: ExpectationLevel
  target_month: string
  created_at: string
  updated_at: string
  profiles: {
    username: string
    avatar_url: string | null
  } | null
}

interface CommentWithProfile {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  } | null
}

export const metadata: Metadata = {
  title: '投稿詳細 - CineNaito',
}

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()

  // ユーザー情報とパラメータを並列取得
  const [{ data: { user } }, { id }] = await Promise.all([
    supabase.auth.getUser(),
    params,
  ])

  // 投稿・コメント・管理者判定・リアクション情報を並列取得
  const [
    { data: planData, error },
    { data: commentsData },
    isAdmin,
    reactionResult,
    { count: reactionCount },
  ] = await Promise.all([
    supabase
      .from('movie_plans')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('plan_comments')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('plan_id', id)
      .order('created_at', { ascending: true }),
    user ? getIsAdmin(supabase, user.id) : Promise.resolve(false),
    user
      ? supabase
          .from('reactions')
          .select('id')
          .eq('plan_id', id)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', id),
  ])

  const plan = planData as MoviePlanWithProfile | null

  if (error || !plan) {
    notFound()
  }

  async function handleDeletePlan() {
    'use server'
    await deleteMoviePlan(id)
    redirect('/dashboard')
  }

  const comments = (commentsData as CommentWithProfile[] | null) || []
  const reaction = reactionResult.data as { id: string } | null

  return (
    <div className="min-h-screen cinema-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 text-slate-400 hover:text-cinema-gold transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              一覧に戻る
            </Button>
          </Link>

          <Card className="glass-card border-white/10">
            {/* YouTube埋め込み */}
            {plan.youtube_url && (
              <div className="p-6 pb-0">
                <YouTubeEmbed url={plan.youtube_url} title={plan.title} />
              </div>
            )}

            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-bold text-white">{plan.title}</h1>
                  <ExpectationBadge expectation={plan.expectation} />
                </div>
                {user && (plan.user_id === user.id || isAdmin) && (
                  <div className="flex items-center gap-2">
                    <Link href={`/plans/${id}/edit`}>
                      <Button variant="outline" className="w-fit border-white/10 text-slate-200 hover:border-cinema-gold/30 hover:text-cinema-gold-light transition-all">
                        <Pencil className="w-4 h-4 mr-2" />
                        この投稿を編集
                      </Button>
                    </Link>
                    <form action={handleDeletePlan}>
                      <Button variant="outline" className="w-fit border-red-500/30 text-red-400 hover:bg-red-500/10">
                        この投稿を削除
                      </Button>
                    </form>
                  </div>
                )}
                <p className="text-slate-400 text-sm">
                  {formatMonth(plan.target_month)} の鑑賞予定
                </p>
                {plan.release_date && (
                  <p className="text-slate-400 text-sm">公開日: {plan.release_date}</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* コメント */}
              {plan.comment && (
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{plan.comment}</p>
              )}

              {/* 映画.com リンク */}
              {plan.movie_url && (
                <a
                  href={plan.movie_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-cinema-gold hover:text-cinema-gold-light transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  映画.comで詳細を見る
                </a>
              )}

              {/* 投稿者情報 */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <Avatar className="w-10 h-10 ring-2 ring-cinema-gold/15">
                  <AvatarImage src={plan.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-cinema-gold/15 text-cinema-gold font-medium">
                    {(plan.profiles?.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-200">
                    {plan.profiles?.username || 'ユーザー'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatRelativeTime(plan.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* クライアントコンポーネント（リアクション・コメント） */}
          <PlanDetailClient
            planId={id}
            currentUserId={user?.id}
            isAdmin={isAdmin}
            isLoggedIn={!!user}
            initialReacted={!!reaction}
            initialReactionCount={reactionCount || 0}
            comments={comments}
          />
        </div>
      </main>
    </div>
  )
}
