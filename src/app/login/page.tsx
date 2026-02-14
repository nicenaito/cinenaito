import { Suspense } from 'react'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center cinema-bg-auth">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
