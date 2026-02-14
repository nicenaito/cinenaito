'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Popcorn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReactionButtonProps {
  planId: string
  initialCount: number
  initialReacted: boolean
  onReaction: (planId: string) => Promise<{ success: boolean; reacted: boolean }>
  isLoggedIn: boolean
  onRequireLogin: () => void
}

export function ReactionButton({
  planId,
  initialCount,
  initialReacted,
  onReaction,
  isLoggedIn,
  onRequireLogin,
}: ReactionButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [reacted, setReacted] = useState(initialReacted)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!isLoggedIn) {
      onRequireLogin()
      return
    }
    // 楽観的更新
    const newReacted = !reacted
    const newCount = newReacted ? count + 1 : count - 1
    setReacted(newReacted)
    setCount(newCount)

    startTransition(async () => {
      try {
        const result = await onReaction(planId)
        if (!result.success) {
          // 失敗時はロールバック
          setReacted(!newReacted)
          setCount(count)
        }
      } catch {
        // エラー時はロールバック
        setReacted(!newReacted)
        setCount(count)
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'gap-2 transition-all duration-200',
        reacted
          ? 'text-cinema-gold hover:text-cinema-gold-light scale-100'
          : 'text-slate-400 hover:text-cinema-gold-light'
      )}
    >
      <Popcorn className={cn(
        'w-4 h-4 transition-transform duration-200',
        reacted && 'fill-current scale-110'
      )} />
      <span>自分も観る</span>
      {count > 0 && <span className={cn('ml-0.5', reacted ? 'text-cinema-gold' : 'text-slate-500')}>({count})</span>}
    </Button>
  )
}
