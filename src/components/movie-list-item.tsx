'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ExpectationBadge } from '@/components/expectation-badge'
import { ReactionButton } from '@/components/reaction-button'
import { formatRelativeTime, formatMonth } from '@/lib/helpers'
import { MoviePlanWithStats } from '@/types/database.types'
import { MessageCircle, Trash2, Pencil, ExternalLink, Play } from 'lucide-react'

interface MovieListItemProps {
  plan: MoviePlanWithStats
  currentUserId?: string
  isAdmin?: boolean
  isLoggedIn: boolean
  userReacted: boolean
  onReaction: (planId: string) => Promise<{ success: boolean; reacted: boolean }>
  onRequireLogin: () => void
  onDelete?: (planId: string) => Promise<void>
  index?: number
}

export const MovieListItem = memo(function MovieListItem({
  plan,
  currentUserId,
  isAdmin = false,
  isLoggedIn,
  userReacted,
  onReaction,
  onRequireLogin,
  onDelete,
  index = 0,
}: MovieListItemProps) {
  const isOwner = currentUserId === plan.user_id
  const canEdit = isOwner
  const canDelete = isOwner || isAdmin
  const releaseMonth = plan.release_month || plan.target_month

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('この投稿を削除しますか？')) return
    await onDelete(plan.id)
  }

  return (
    <div
      className="glass-card glass-card-hover px-4 py-3 animate-fade-in-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* タイトル・公開月・期待度 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/plans/${plan.id}`}
              prefetch={false}
              className="text-white font-semibold hover:text-cinema-gold-light transition-colors truncate"
            >
              {plan.title}
            </Link>
            <ExpectationBadge expectation={plan.expectation} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span>{formatMonth(releaseMonth)} 公開予定</span>
            {plan.release_date && (
              <span className="text-slate-400">公開日: {plan.release_date}</span>
            )}
            {plan.comment && (
              <span className="hidden md:inline text-slate-400 truncate max-w-[300px]">
                {plan.comment}
              </span>
            )}
          </div>
        </div>

        {/* 投稿者 */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Avatar className="w-6 h-6 ring-1 ring-cinema-gold/15">
            <AvatarImage src={plan.avatar_url || undefined} />
            <AvatarFallback className="bg-cinema-gold/15 text-cinema-gold text-[10px] font-medium">
              {plan.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-slate-400 max-w-[80px] truncate">
            {plan.username}
          </span>
          <span className="text-xs text-slate-600">
            {formatRelativeTime(plan.created_at)}
          </span>
        </div>

        {/* アクション */}
        <div className="flex items-center gap-1 shrink-0">
          <ReactionButton
            planId={plan.id}
            initialCount={plan.reaction_count}
            initialReacted={userReacted}
            onReaction={onReaction}
            isLoggedIn={isLoggedIn}
            onRequireLogin={onRequireLogin}
          />
          <Link href={`/plans/${plan.id}`} prefetch={false}>
            <Button variant="ghost" size="sm" className="gap-1 text-slate-400 hover:text-cinema-gold-light transition-colors px-2">
              <MessageCircle className="w-4 h-4" />
              {plan.comment_count > 0 && <span className="text-cinema-gold/70 text-xs">({plan.comment_count})</span>}
            </Button>
          </Link>
          {plan.movie_url && (
            <a href={plan.movie_url} target="_blank" rel="noopener noreferrer" title="映画.comで見る">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-cinema-gold-light transition-colors px-2">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
          {plan.youtube_url && (
            <a href={plan.youtube_url} target="_blank" rel="noopener noreferrer" title="YouTube予告編">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400 transition-colors px-2">
                <Play className="w-4 h-4" />
              </Button>
            </a>
          )}
          {canEdit && (
            <Link href={`/plans/${plan.id}/edit`} prefetch={false}>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300 transition-colors px-2">
                <Pencil className="w-4 h-4" />
              </Button>
            </Link>
          )}
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-400/70 hover:text-red-400 transition-colors px-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})
