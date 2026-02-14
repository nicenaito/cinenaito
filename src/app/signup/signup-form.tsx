'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signUpWithPassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Film } from 'lucide-react'
import { toast } from 'sonner'

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nextPath = searchParams.get('next') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signUpWithPassword(email, password, username)
      if (!result.success) {
        setError(result.error || '新規登録に失敗しました')
        toast.error(result.error || '新規登録に失敗しました')
        return
      }

      if (result.needsEmailConfirmation) {
        toast.success('登録確認メールを送信しました')
        router.push('/login?message=check_email')
        return
      }

      toast.success('アカウントを作成しました')
      router.push(nextPath)
    } catch (err) {
      const message = err instanceof Error ? err.message : '新規登録に失敗しました'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center cinema-bg-auth">
      <Card className="w-full max-w-md mx-4 glass-card border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-cinema-gold to-cinema-gold-dark shadow-[0_0_30px_rgba(212,168,83,0.2)]">
            <Film className="w-8 h-8 text-cinema-deep" />
          </div>
          <CardTitle className="text-2xl font-bold text-cinema-gradient">CineNaito</CardTitle>
          <CardDescription className="text-slate-400">新規登録</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">ユーザー名</Label>
              <Input
                id="username"
                type="text"
                placeholder="映画好き太郎"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cinema-gold/50 focus:ring-cinema-gold/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cinema-gold/50 focus:ring-cinema-gold/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cinema-gold/50 focus:ring-cinema-gold/20"
              />
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full btn-cinema rounded-lg"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? '登録中...' : '新規登録'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400">
            すでにアカウントをお持ちの方は{' '}
            <Link
              href={nextPath !== '/dashboard' ? `/login?next=${encodeURIComponent(nextPath)}` : '/login'}
              className="text-cinema-gold hover:text-cinema-gold-light transition-colors"
            >
              ログイン
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
