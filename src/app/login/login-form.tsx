'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signInWithPassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Film } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nextPath = searchParams.get('next')
  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signInWithPassword(email, password, nextPath)
      if (!result.success) {
        setError(result.error || 'ログインに失敗しました')
        toast.error(result.error || 'ログインに失敗しました')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログインに失敗しました'
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
          <CardDescription className="text-slate-400">ログイン</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message === 'check_email' && (
            <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
              登録確認メールを送信しました。メール内のリンクを開いてからログインしてください。
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
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
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400">
            ログインして投稿やリアクションができます。
          </p>
          <p className="text-center text-sm text-slate-400">
            アカウントをお持ちでない方は{' '}
            <Link
              href={nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : '/signup'}
              className="text-cinema-gold hover:text-cinema-gold-light transition-colors"
            >
              新規登録
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
