'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { MovieCard } from '@/components/movie-card'
import { MovieListItem } from '@/components/movie-list-item'
import { MonthFilter } from '@/components/month-filter'
import { toggleReaction, deleteMoviePlan, updateViewMode } from '@/app/actions'
import { extractSortableDateFromReleaseDate } from '@/lib/helpers'
import { MoviePlanWithStats, ViewMode } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Film, Clapperboard, Plus, LayoutGrid, List, Copy } from 'lucide-react'
import { toast } from 'sonner'

type SortOption = 'release_asc' | 'newest'
const PAGE_SIZE = 9

interface DashboardClientProps {
  plans: MoviePlanWithStats[]
  selectedMonth: string
  currentUserId?: string
  isAdmin?: boolean
  isLoggedIn: boolean
  reactedPlanIds: string[]
  initialSortBy?: SortOption
  initialViewMode?: ViewMode
}

export function DashboardClient({
  plans,
  selectedMonth,
  currentUserId,
  isAdmin = false,
  isLoggedIn,
  reactedPlanIds,
  initialSortBy = 'release_asc',
  initialViewMode = 'card',
}: DashboardClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [planItems, setPlanItems] = useState(plans)
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy)
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [, startTransition] = useTransition()
  const reactedPlanIdSet = useMemo(() => new Set(reactedPlanIds), [reactedPlanIds])

  useEffect(() => {
    setPlanItems(plans)
  }, [plans])

  const handleMonthChange = useCallback((value: string) => {
    setVisibleCount(PAGE_SIZE)
    router.push(`/dashboard?month=${value}&sort=${sortBy}`)
  }, [router, sortBy])

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    if (isLoggedIn) {
      startTransition(() => {
        updateViewMode(mode)
      })
    }
  }, [isLoggedIn, startTransition])

  const handleRequireLogin = useCallback(() => {
    toast.error('リアクションにはログインが必要です')
    const next = pathname || '/dashboard'
    router.push(`/login?next=${encodeURIComponent(next)}`)
  }, [pathname, router])

  const handleReaction = useCallback(async (planId: string) => {
    if (!isLoggedIn) {
      handleRequireLogin()
      return { success: false, reacted: false }
    }
    return await toggleReaction(planId)
  }, [isLoggedIn, handleRequireLogin])

  const handleDelete = useCallback(async (planId: string) => {
    const result = await deleteMoviePlan(planId)
    if (!result.success) {
      alert(result.error || '削除に失敗しました')
      return
    }
    setPlanItems((current) => current.filter((plan) => plan.id !== planId))
  }, [])

  const displayedItems = useMemo(() => {
    const sorted = [...planItems]
    switch (sortBy) {
      case 'newest':
        sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'release_asc':
        sorted.sort((a, b) => {
          const aDate = extractSortableDateFromReleaseDate(a.release_date) ?? a.target_month
          const bDate = extractSortableDateFromReleaseDate(b.release_date) ?? b.target_month
          if (aDate === bDate) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }
          return aDate.localeCompare(bDate)
        })
        break
    }
    return sorted
  }, [planItems, sortBy])

  const visibleItems = useMemo(
    () => displayedItems.slice(0, visibleCount),
    [displayedItems, visibleCount]
  )

  const hasMore = displayedItems.length > visibleCount

  const handleCopyList = useCallback(async () => {
    const text = displayedItems
      .map((plan) => {
        const date = plan.release_date || plan.release_month || plan.target_month || ''
        return `${plan.title}\t${date}`
      })
      .join('\n')
    await navigator.clipboard.writeText(text)
    toast.success('一覧をクリップボードにコピーしました')
  }, [displayedItems])

  return (
    <div>
      {/* ヘッダー部分 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Clapperboard className="w-7 h-7 text-cinema-gold" />
          <h1 className="text-2xl font-bold text-cinema-gradient">公開予定一覧</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {isLoggedIn && (
            <Link href="/new" className="hidden sm:block">
              <Button size="default" className="gap-2 btn-cinema rounded-lg px-6 shadow-lg shadow-cinema-gold/20">
                <Plus className="w-5 h-5" />
                <span className="font-bold">投稿する</span>
              </Button>
            </Link>
          )}
          <MonthFilter value={selectedMonth} onChange={handleMonthChange} />
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => {
              setSortBy(value)
              setVisibleCount(PAGE_SIZE)
              router.push(`/dashboard?month=${selectedMonth}&sort=${value}`)
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px] glass-card border-white/10 text-white hover:border-cinema-gold/30 transition-colors">
              <SelectValue placeholder="並び順を選択" />
            </SelectTrigger>
            <SelectContent className="z-[60] bg-cinema-surface/95 border-white/10 text-white backdrop-blur-xl">
              <SelectItem value="release_asc" className="text-white hover:bg-cinema-gold/10 focus:bg-cinema-gold/10 focus:text-white">
                公開日順
              </SelectItem>
              <SelectItem value="newest" className="text-white hover:bg-cinema-gold/10 focus:bg-cinema-gold/10 focus:text-white">
                投稿順
              </SelectItem>
            </SelectContent>
          </Select>
          {/* 表示切替トグル */}
          <div className="flex glass-card border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => handleViewModeChange('card')}
              className={`flex items-center justify-center w-10 h-10 transition-colors ${
                viewMode === 'card'
                  ? 'bg-cinema-gold/20 text-cinema-gold'
                  : 'text-slate-400 hover:text-cinema-gold-light hover:bg-white/5'
              }`}
              title="カード表示"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('list')}
              className={`flex items-center justify-center w-10 h-10 transition-colors ${
                viewMode === 'list'
                  ? 'bg-cinema-gold/20 text-cinema-gold'
                  : 'text-slate-400 hover:text-cinema-gold-light hover:bg-white/5'
              }`}
              title="一覧表示"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 映画一覧 */}
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
      ) : viewMode === 'card' ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((plan, i) => (
              <MovieCard
                key={plan.id}
                plan={plan}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                isLoggedIn={isLoggedIn}
                userReacted={reactedPlanIdSet.has(plan.id)}
                onReaction={handleReaction}
                onRequireLogin={handleRequireLogin}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                className="border-white/10 text-slate-300 hover:text-cinema-gold-light hover:border-cinema-gold/30 transition-colors"
              >
                もっと見る ({visibleItems.length}/{displayedItems.length})
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyList}
              className="gap-2 text-slate-400 hover:text-cinema-gold-light transition-colors"
            >
              <Copy className="w-4 h-4" />
              一覧をコピー
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {visibleItems.map((plan, i) => (
              <MovieListItem
                key={plan.id}
                plan={plan}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                isLoggedIn={isLoggedIn}
                userReacted={reactedPlanIdSet.has(plan.id)}
                onReaction={handleReaction}
                onRequireLogin={handleRequireLogin}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                className="border-white/10 text-slate-300 hover:text-cinema-gold-light hover:border-cinema-gold/30 transition-colors"
              >
                もっと見る ({visibleItems.length}/{displayedItems.length})
              </Button>
            </div>
          )}
        </>
      )}

      {/* モバイル用浮遊投稿ボタン */}
      {isLoggedIn && (
        <div className="fixed bottom-8 right-6 z-40 sm:hidden">
          <Link href="/new">
            <Button size="lg" className="w-14 h-14 rounded-full p-0 btn-cinema shadow-[0_8px_32px_rgba(212,168,83,0.4)] border border-white/20">
              <Plus className="w-8 h-8" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
