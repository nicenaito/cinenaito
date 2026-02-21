import { Header } from '@/components/header'
import { Clapperboard } from 'lucide-react'

function CardSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden animate-pulse">
      <div className="p-4 pb-2 space-y-3">
        <div className="h-5 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-5 bg-white/5 rounded w-20" />
      </div>
      <div className="px-4 pb-4 space-y-3">
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
          <div className="w-8 h-8 rounded-full bg-white/5" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-white/5 rounded w-24" />
            <div className="h-2.5 bg-white/5 rounded w-16" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 p-4">
        <div className="flex gap-3">
          <div className="h-8 bg-white/5 rounded w-28" />
          <div className="h-8 bg-white/5 rounded w-24" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen cinema-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Clapperboard className="w-7 h-7 text-cinema-gold" />
            <h1 className="text-2xl font-bold text-cinema-gradient">鑑賞予定一覧</h1>
          </div>
          <div className="flex gap-3">
            <div className="w-[180px] h-10 rounded-md bg-white/5 animate-pulse" />
            <div className="w-[220px] h-10 rounded-md bg-white/5 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}
