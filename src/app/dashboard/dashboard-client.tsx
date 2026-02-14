'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { MovieCard } from '@/components/movie-card'
import { MonthFilter } from '@/components/month-filter'
import { toggleReaction, deleteMoviePlan } from '@/app/actions'
import { MoviePlanWithStats } from '@/types/database.types'
import { extractYearMonthFromReleaseDate } from '@/lib/helpers'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Film, Clapperboard } from 'lucide-react'
import { toast } from 'sonner'

type SortOption = 'reaction_desc' | 'newest' | 'release_asc'

interface DashboardClientProps {
  plans: MoviePlanWithStats[]
  selectedMonth: string
  currentUserId?: string
  isAdmin?: boolean
  isLoggedIn: boolean
  reactedPlanIds: string[]
}

export function DashboardClient({
  plans,
  selectedMonth,
  currentUserId,
  isAdmin = false,
  isLoggedIn,
  reactedPlanIds,
}: DashboardClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [items, setItems] = useState(plans)
  const [sortBy, setSortBy] = useState<SortOption>('reaction_desc')

  // propsが変わった（月フィルタ切り替え等）ときにローカルstateを同期
  useEffect(() => {
    setItems(plans)
  }, [plans])

  const handleMonthChange = (value: string) => {
    router.push(`/dashboard?month=${value}`)
  }

  const handleRequireLogin = () => {
    toast.error('リアクションにはログインが必要です')
    const next = pathname || '/dashboard'
    router.push(`/login?next=${encodeURIComponent(next)}`)
  }

  const handleReaction = async (planId: string) => {
    if (!isLoggedIn) {
      handleRequireLogin()
      return { success: false, reacted: false }
    }
    return await toggleReaction(planId)
  }

  const handleDelete = async (planId: string) => {
    const prev = items
    setItems((current) => current.filter((plan) => plan.id !== planId))
    const result = await deleteMoviePlan(planId)
    if (!result.success) {
      setItems(prev)
      alert(result.error || '削除に失敗しました')
    }
  }

  const displayedItems = useMemo(() => {
    const getPlanMonth = (plan: MoviePlanWithStats) => {
      if (plan.release_month) return plan.release_month
      return extractYearMonthFromReleaseDate(plan.release_date) || plan.target_month
    }

    const filtered = items.filter((plan) => getPlanMonth(plan) === selectedMonth)

    const sorted = [...filtered]
    if (sortBy === 'reaction_desc') {
      sorted.sort((a, b) => {
        if (b.reaction_count !== a.reaction_count) {
          return b.reaction_count - a.reaction_count
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }

    if (sortBy === 'newest') {
      sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    if (sortBy === 'release_asc') {
      sorted.sort((a, b) => {
        const aReleaseMonth = extractYearMonthFromReleaseDate(a.release_date) || a.target_month
        const bReleaseMonth = extractYearMonthFromReleaseDate(b.release_date) || b.target_month
        if (aReleaseMonth === bReleaseMonth) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        return aReleaseMonth.localeCompare(bReleaseMonth)
      })
    }

    return sorted
  }, [items, selectedMonth, sortBy])

  return (
    <div>
      {/* ヘッダー部分 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Clapperboard className="w-7 h-7 text-cinema-gold" />
          <h1 className="text-2xl font-bold text-cinema-gradient">鑑賞予定一覧</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <MonthFilter value={selectedMonth} onChange={handleMonthChange} />
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-[220px] glass-card border-white/10 text-white hover:border-cinema-gold/30 transition-colors">
              <SelectValue placeholder="並び順を選択" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              <SelectItem value="reaction_desc" className="text-white hover:bg-cinema-gold/10 focus:bg-cinema-gold/10 focus:text-white">
                自分も観るが多い順
              </SelectItem>
              <SelectItem value="newest" className="text-white hover:bg-cinema-gold/10 focus:bg-cinema-gold/10 focus:text-white">
                新しい投稿順
              </SelectItem>
              <SelectItem value="release_asc" className="text-white hover:bg-cinema-gold/10 focus:bg-cinema-gold/10 focus:text-white">
                公開日の早い順
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 映画カード一覧 */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-card mb-6">
            <Film className="w-10 h-10 text-cinema-gold/50" />
          </div>
          <h2 className="text-xl font-semibold text-slate-300 mb-2">
            該当月の投稿がありません
          </h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            別の年月を選択するか、新しく投稿してみましょう。
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedItems.map((plan, i) => (
            <MovieCard
              key={plan.id}
              plan={plan}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              isLoggedIn={isLoggedIn}
              userReacted={reactedPlanIds.includes(plan.id)}
              onReaction={handleReaction}
              onRequireLogin={handleRequireLogin}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
