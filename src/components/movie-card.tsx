'use client'

import { memo, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ExpectationBadge } from '@/components/expectation-badge'
import { ReactionButton } from '@/components/reaction-button'
import { WatchedButton } from '@/components/watched-button'
import { formatRelativeTime, formatMonth } from '@/lib/helpers'
import { MoviePlanWithStats, WatchedUser } from '@/types/database.types'
import { MessageCircle, Trash2, Pencil, ExternalLink, Play } from 'lucide-react'
import Link from 'next/link'

const YouTubeEmbed = dynamic(() => import('@/components/youtube-embed').then(m => ({ default: m.YouTubeEmbed })), {
  loading: () => <div className="aspect-video rounded-lg bg-white/5 animate-pulse" />,
})
const EigaEmbedCard = dynamic(() => import('@/components/eiga-embed-card').then(m => ({ default: m.EigaEmbedCard })), {
  loading: () => <div className="h-20 rounded-lg bg-white/5 animate-pulse" />,
})

interface MovieCardProps {
  plan: MoviePlanWithStats
  currentUserId?: string
  currentUsername?: string
  currentAvatarUrl?: string | null
  isAdmin?: boolean
  isLoggedIn: boolean
  userReacted: boolean
  userWatched: boolean
  onReaction: (planId: string) => Promise<{ success: boolean; reacted: boolean }>
  onToggleWatched: (planId: string) => Promise<{ success: boolean; watched: boolean }>
  onRequireLogin: () => void
  onDelete?: (planId: string) => Promise<void>
  index?: number
}

export const MovieCard = memo(function MovieCard({
  plan,
  currentUserId,
  currentUsername,
  currentAvatarUrl,
  isAdmin = false,
  isLoggedIn,
  userReacted,
  userWatched,
  onReaction,
  onToggleWatched,
  onRequireLogin,
  onDelete,
  index = 0,
}: MovieCardProps) {
  const isOwner = currentUserId === plan.user_id
  const canEdit = isOwner
  const canDelete = isOwner || isAdmin
  const releaseMonth = plan.release_month || plan.target_month
  const cardRef = useRef<HTMLDivElement>(null)
  const [shouldLoadEmbeds, setShouldLoadEmbeds] = useState(index < 3)

  useEffect(() => {
    if (shouldLoadEmbeds) return
    const node = cardRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadEmbeds(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldLoadEmbeds])

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('この投稿を削除しますか？')) return
    await onDelete(plan.id)
  }

  return (
    <Card
      ref={cardRef}
      className="glass-card glass-card-hover overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white line-clamp-2 leading-snug break-words">
              {plan.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {formatMonth(releaseMonth)} 公開予定
            </p>
            {plan.release_date && (
              <p className="text-xs text-slate-400 mt-1">公開日: {plan.release_date}</p>
            )}
            <div className="mt-2">
              <ExpectationBadge expectation={plan.expectation} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* コメント */}
        {plan.comment && (
          <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
            {plan.comment}
          </p>
        )}

        {shouldLoadEmbeds && plan.movie_url && (
          <EigaEmbedCard movieUrl={plan.movie_url} title={plan.title} />
        )}

        {/* YouTube埋め込み */}
        {shouldLoadEmbeds && plan.youtube_url && (
          <YouTubeEmbed url={plan.youtube_url} title={plan.title} />
        )}

        {/* 投稿者情報 */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
          <Avatar className="w-8 h-8 ring-1 ring-cinema-gold/15">
            <AvatarImage src={plan.avatar_url || undefined} />
            <AvatarFallback className="bg-cinema-gold/15 text-cinema-gold text-xs font-medium">
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

      <CardFooter className="border-t border-white/5 pt-4">
        <div className="flex flex-col gap-3 w-full">
          {/* 鑑賞済みセクション */}
          <WatchedButton
            planId={plan.id}
            initialWatched={userWatched}
            initialWatchedUsers={plan.watched_users || []}
            onToggleWatched={onToggleWatched}
            isLoggedIn={isLoggedIn}
            onRequireLogin={onRequireLogin}
            currentUserId={currentUserId}
            currentUsername={currentUsername}
            currentAvatarUrl={currentAvatarUrl}
          />

          <div className="flex items-center gap-3 flex-wrap">
            {/* リアクションボタン */}
            <ReactionButton
              planId={plan.id}
              initialCount={plan.reaction_count}
              initialReacted={userReacted}
              onReaction={onReaction}
              isLoggedIn={isLoggedIn}
              onRequireLogin={onRequireLogin}
            />

            {/* コメント数 */}
            <Link href={`/plans/${plan.id}`} prefetch={false}>
              <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-cinema-gold-light transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>コメント</span>
                {plan.comment_count > 0 && <span className="text-cinema-gold/70">({plan.comment_count})</span>}
              </Button>
            </Link>

            {/* 外部リンク */}
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
                <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-slate-300 transition-colors">
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline">編集</span>
                </Button>
              </Link>
            )}

            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="ml-auto text-red-400/70 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
})
