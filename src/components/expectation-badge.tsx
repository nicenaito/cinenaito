import { ExpectationLevel } from '@/types/database.types'
import { Badge } from '@/components/ui/badge'

interface ExpectationBadgeProps {
  expectation: ExpectationLevel
}

const expectationConfig: Record<ExpectationLevel, { label: string; className: string }> = {
  '絶対観る': {
    label: '🔥 絶対観る',
    className: 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30',
  },
  '時間が合えば': {
    label: '⏰ 時間が合えば',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30',
  },
  '気にはなっている': {
    label: '👀 気にはなっている',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30',
  },
}

export function ExpectationBadge({ expectation }: ExpectationBadgeProps) {
  const config = expectationConfig[expectation]
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
