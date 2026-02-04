'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MovieCard } from '@/components/movie-card'
import { MonthFilter } from '@/components/month-filter'
import { toggleReaction, deleteMoviePlan } from '@/app/actions'
import { MoviePlanWithStats } from '@/types/database.types'
import { Film } from 'lucide-react'

interface DashboardClientProps {
  plans: MoviePlanWithStats[]
  selectedMonth: string
  currentUserId: string
  isAdmin: boolean
  reactedPlanIds: string[]
}

export function DashboardClient({
  plans,
  selectedMonth,
  currentUserId,
  isAdmin,
  reactedPlanIds,
}: DashboardClientProps) {
  const router = useRouter()
  const [items, setItems] = useState(plans)

  const handleMonthChange = (value: string) => {
    if (value === 'all') {
      router.push('/dashboard')
    } else {
      router.push(`/dashboard?month=${value}`)
    }
  }

  const handleReaction = async (planId: string) => {
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

  return (
    <div>
      {/* ヘッダー部分 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white">鑑賞予定一覧</h1>
        <MonthFilter value={selectedMonth} onChange={handleMonthChange} />
      </div>

      {/* 映画カード一覧 */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Film className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold text-slate-400 mb-2">
            まだ投稿がありません
          </h2>
          <p className="text-slate-500">
            最初の映画鑑賞予定を投稿してみましょう！
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((plan) => (
            <MovieCard
              key={plan.id}
              plan={plan}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              userReacted={reactedPlanIds.includes(plan.id)}
              onReaction={handleReaction}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
