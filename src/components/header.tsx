import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Film, Plus, LogOut, Shield } from 'lucide-react'
import { Profile } from '@/types/database.types'

export async function Header() {
  const supabase = await createClient()
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
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors">
          <Film className="w-6 h-6" />
          <span className="font-bold text-xl">CineNaito</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            {profile?.is_admin && (
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="gap-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
                  <Shield className="w-4 h-4" />
                  管理
                </Button>
              </Link>
            )}
            <Link href="/new">
              <Button variant="outline" size="sm" className="gap-2 border-purple-500 text-purple-400 hover:bg-purple-500/10">
                <Plus className="w-4 h-4" />
                投稿
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-purple-600 text-white text-xs">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-300 hidden sm:block">
                {profile?.username || user.user_metadata?.full_name || 'ユーザー'}
              </span>
            </div>

            <form action={signOut}>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                ログイン
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                新規登録
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
