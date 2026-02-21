import { Header } from '@/components/header'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PlanDetailLoading() {
  return (
    <div className="min-h-screen cinema-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 text-slate-400 hover:text-cinema-gold transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              一覧に戻る
            </Button>
          </Link>

          <div className="glass-card border-white/10 rounded-xl overflow-hidden animate-pulse">
            <div className="p-6 space-y-4">
              <div className="h-7 bg-white/5 rounded w-2/3" />
              <div className="h-4 bg-white/5 rounded w-1/4" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
              <div className="space-y-2 pt-4">
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-white/5 rounded w-24" />
                  <div className="h-2.5 bg-white/5 rounded w-16" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 glass-card border-white/10 rounded-xl p-6 animate-pulse">
            <div className="h-5 bg-white/5 rounded w-32 mb-4" />
            <div className="h-20 bg-white/5 rounded w-full" />
          </div>
        </div>
      </main>
    </div>
  )
}
