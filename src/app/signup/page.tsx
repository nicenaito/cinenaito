import { Suspense } from 'react'
import { SignupForm } from './signup-form'

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center cinema-bg-auth">
        <p className="text-slate-400">読み込み中...</p>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
