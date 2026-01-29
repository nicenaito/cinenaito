'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { YouTubeEmbed } from '@/components/youtube-embed'
import { ExpectationBadge } from '@/components/expectation-badge'
import { ReactionButton } from '@/components/reaction-button'
import { formatRelativeTime, formatMonth } from '@/lib/helpers'
import { MoviePlanWithStats } from '@/types/database.types'
import { MessageCircle, ExternalLink, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface MovieCardProps {
  plan: MoviePlanWithStats
  currentUserId?: string
  userReacted: boolean
  onReaction: (planId: string) => Promise<{ success: boolean; reacted: boolean }>
  onDelete?: (planId: string) => Promise<void>
}

export function MovieCard({
  plan,
  currentUserId,
  userReacted,
  onReaction,
  onDelete,
}: MovieCardProps) {
  const isOwner = currentUserId === plan.user_id

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('この投稿を削除しますか？')) return
    await onDelete(plan.id)
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
      {/* YouTube埋め込み */}
      {plan.youtube_url && (
        <div className="p-4 pb-0">
          <YouTubeEmbed url={plan.youtube_url} title={plan.title} />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {plan.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {formatMonth(plan.target_month)} の予定
            </p>
            <div className="mt-2">
              <ExpectationBadge expectation={plan.expectation} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* コメント */}
        {plan.comment && (
          <p className="text-slate-300 text-sm whitespace-pre-wrap">
            {plan.comment}
          </p>
        )}

        {/* 映画.com リンク */}
        {plan.movie_url && (
          <a
            href={plan.movie_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            映画.comで詳細を見る
          </a>
        )}

        {/* 投稿者情報 */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
          <Avatar className="w-8 h-8">
            <AvatarImage src={plan.avatar_url || undefined} />
            <AvatarFallback className="bg-purple-600 text-white text-xs">
              {plan.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {plan.username}
            </p>
            <p className="text-xs text-slate-500">
              {formatRelativeTime(plan.created_at)}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-slate-700 pt-4">
        <div className="flex items-center gap-4 w-full">
          {/* リアクションボタン */}
          <ReactionButton
            planId={plan.id}
            initialCount={plan.reaction_count}
            initialReacted={userReacted}
            onReaction={onReaction}
          />

          {/* コメント数 */}
          <Link href={`/plans/${plan.id}`}>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-slate-300">
              <MessageCircle className="w-4 h-4" />
              <span>コメント</span>
              {plan.comment_count > 0 && <span>({plan.comment_count})</span>}
            </Button>
          </Link>

          {isOwner && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
