import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getIsAdmin } from '@/lib/admin'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'ユーザー管理 - CineNaito',
  description: '管理者ユーザーの管理',
}

async function updateAdminRole(formData: FormData) {
  'use server'

  const userId = formData.get('userId')?.toString()
  const makeAdmin = formData.get('makeAdmin') === 'true'
  if (!userId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = await getIsAdmin(supabase, user.id)
  if (!isAdmin) {
    redirect('/dashboard')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: makeAdmin })
    .eq('id', userId)

  if (error) {
    console.error('管理者更新エラー:', error)
  }

  revalidatePath('/admin/users')
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = await getIsAdmin(supabase, user.id)
  if (!isAdmin) {
    redirect('/dashboard')
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, is_admin, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('ユーザー取得エラー:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">ユーザー管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(profiles || []).map((profile) => (
                <div
                  key={profile.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between border border-slate-700 rounded-lg p-4"
                >
                  <div className="min-w-0">
                    <p className="text-slate-100 font-medium truncate">{profile.username}</p>
                    <p className="text-xs text-slate-500 truncate">{profile.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {profile.is_admin ? (
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
                        管理者
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-slate-600 text-slate-400">
                        一般
                      </Badge>
                    )}
                    {profile.is_admin ? (
                      <form action={updateAdminRole}>
                        <input type="hidden" name="userId" value={profile.id} />
                        <input type="hidden" name="makeAdmin" value="false" />
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-500/60 text-amber-400 hover:bg-amber-500/10"
                          disabled={profile.id === user.id}
                        >
                          管理者解除
                        </Button>
                      </form>
                    ) : (
                      <form action={updateAdminRole}>
                        <input type="hidden" name="userId" value={profile.id} />
                        <input type="hidden" name="makeAdmin" value="true" />
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          管理者にする
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
