import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Film, Plus, LogOut, Shield, Sparkles } from 'lucide-react'
import { Profile } from '@/types/database.types'

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Film className="w-6 h-6 text-cinema-gold transition-transform group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-cinema-gradient leading-tight">CineNaito</span>
            <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">映画好きサークル</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-20 h-8 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </header>
  )
}

async function HeaderContent() {
  const supabase = await createClient()

  // ユーザー情報とプロフィールを効率的に取得
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    profile = profileData as Profile | null
  }

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Film className="w-6 h-6 text-cinema-gold transition-transform group-hover:scale-110" />
            <Sparkles className="w-3 h-3 text-cinema-gold-light absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-cinema-gradient leading-tight">CineNaito</span>
            <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">映画好きサークル</span>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            {profile?.is_admin && (
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="gap-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 transition-all">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">管理</span>
                </Button>
              </Link>
            )}
            <Link href="/new">
              <Button size="sm" className="gap-2 btn-cinema rounded-lg">
                <Plus className="w-4 h-4" />
                投稿
              </Button>
            </Link>

            <div className="flex items-center gap-2.5 ml-1">
              <Avatar className="w-8 h-8 ring-2 ring-cinema-gold/20">
                <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-cinema-gold/20 text-cinema-gold text-xs font-semibold">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-300 hidden sm:block font-medium">
                {profile?.username || user.user_metadata?.full_name || 'ユーザー'}
              </span>
            </div>

            <form action={signOut}>
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-cinema-gold transition-colors">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cinema-gold transition-colors">
                ログイン
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="btn-cinema rounded-lg">
                新規登録
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export function Header() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderContent />
    </Suspense>
  )
}
