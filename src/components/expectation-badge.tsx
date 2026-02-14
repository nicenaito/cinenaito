import { ExpectationLevel } from '@/types/database.types'
import { Badge } from '@/components/ui/badge'

interface ExpectationBadgeProps {
  expectation: ExpectationLevel
}

const expectationConfig: Record<ExpectationLevel, { label: string; className: string }> = {
  '絶対観る': {
    label: '🔥 絶対観る',
    className: 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
  },
  '時間が合えば': {
    label: '⏰ 時間が合えば',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
  },
  '気にはなっている': {
    label: '👀 気にはなっている',
    className: 'bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/25 shadow-[0_0_10px_rgba(14,165,233,0.08)]',
  },
}

export function ExpectationBadge({ expectation }: ExpectationBadgeProps) {
  const config = expectationConfig[expectation]

  return (
    <Badge variant="outline" className={`${config.className} transition-all`}>
      {config.label}
    </Badge>
  )
}
