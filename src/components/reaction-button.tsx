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
}

export function ReactionButton({
  planId,
  initialCount,
  initialReacted,
  onReaction,
}: ReactionButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [reacted, setReacted] = useState(initialReacted)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
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
        'gap-2 transition-colors',
        reacted
          ? 'text-orange-400 hover:text-orange-300'
          : 'text-slate-400 hover:text-slate-300'
      )}
    >
      <Popcorn className={cn('w-4 h-4', reacted && 'fill-current')} />
      <span>自分も観る</span>
      {count > 0 && <span className="ml-1">({count})</span>}
    </Button>
  )
}
