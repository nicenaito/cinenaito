'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WatchedUser } from '@/types/database.types'

interface WatchedButtonProps {
  planId: string
  initialWatched: boolean
  initialWatchedUsers: WatchedUser[]
  onToggleWatched: (planId: string) => Promise<{ success: boolean; watched: boolean }>
  isLoggedIn: boolean
  onRequireLogin: () => void
  currentUserId?: string
  currentUsername?: string
  currentAvatarUrl?: string | null
}

export function WatchedButton({
  planId,
  initialWatched,
  initialWatchedUsers,
  onToggleWatched,
  isLoggedIn,
  onRequireLogin,
  currentUserId,
  currentUsername,
  currentAvatarUrl,
}: WatchedButtonProps) {
  const [watched, setWatched] = useState(initialWatched)
  const [watchedUsers, setWatchedUsers] = useState<WatchedUser[]>(initialWatchedUsers)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!isLoggedIn) {
      onRequireLogin()
      return
    }

    const newWatched = !watched

    // 楽観的更新
    setWatched(newWatched)
    if (newWatched && currentUserId) {
      setWatchedUsers((prev) => [
        ...prev,
        {
          user_id: currentUserId,
          username: currentUsername || 'ユーザー',
          avatar_url: currentAvatarUrl ?? null,
        },
      ])
    } else {
      setWatchedUsers((prev) => prev.filter((u) => u.user_id !== currentUserId))
    }

    startTransition(async () => {
      try {
        const result = await onToggleWatched(planId)
        if (!result.success) {
          // 失敗時はロールバック
          setWatched(!newWatched)
          if (newWatched) {
            setWatchedUsers((prev) => prev.filter((u) => u.user_id !== currentUserId))
          } else {
            setWatchedUsers(initialWatchedUsers)
          }
        }
      } catch {
        // エラー時はロールバック
        setWatched(!newWatched)
        setWatchedUsers(initialWatchedUsers)
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* 鑑賞済みトグルボタン */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          disabled={isPending}
          className={cn(
            'gap-2 transition-all duration-200',
            watched
              ? 'text-emerald-400 hover:text-emerald-300'
              : 'text-slate-400 hover:text-emerald-300'
          )}
        >
          {watched ? (
            <Eye className={cn(
              'w-4 h-4 transition-transform duration-200',
              'fill-current scale-110'
            )} />
          ) : (
            <EyeOff className="w-4 h-4 transition-transform duration-200" />
          )}
          <span>鑑賞済み</span>
          {watchedUsers.length > 0 && (
            <span className={cn('ml-0.5', watched ? 'text-emerald-400' : 'text-slate-500')}>
              ({watchedUsers.length})
            </span>
          )}
        </Button>

        {/* 鑑賞済みユーザーアバター表示 */}
        {watchedUsers.length > 0 && (
          <div className="flex items-center -space-x-1.5">
            {watchedUsers.slice(0, 5).map((user) => (
              <Avatar
                key={user.user_id}
                className="w-6 h-6 ring-2 ring-cinema-deep border-0 transition-transform hover:scale-110 hover:z-10"
                title={`${user.username} - 鑑賞済み`}
              >
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            ))}
            {watchedUsers.length > 5 && (
              <span className="ml-2 text-xs text-slate-400">
                +{watchedUsers.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
