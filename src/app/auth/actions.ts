'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
function resolveNextPath(nextPath?: string | null) {
  if (!nextPath) return '/dashboard'
  if (nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    return nextPath
  }
  return '/dashboard'
}

export async function signInWithPassword(
  email: string,
  password: string,
  nextPath?: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // メールアドレスとパスワードでログイン
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('ログインエラー:', signInError)
      return { success: false, error: 'メールアドレスまたはパスワードが違います' }
    }

    if (!data.user) {
      return { success: false, error: 'ログインに失敗しました' }
    }

    // 次のページへリダイレクト
    redirect(resolveNextPath(nextPath))
  } catch (err) {
    console.error('認証エラー:', err)
    return { success: false, error: 'ログインに失敗しました' }
  }
}

export async function signUpWithPassword(
  email: string,
  password: string,
  username: string
): Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username,
        },
      },
    })

    if (signUpError) {
      console.error('サインアップエラー:', signUpError)
      return { success: false, error: '新規登録に失敗しました' }
    }

    const needsEmailConfirmation = !data.session
    return { success: true, needsEmailConfirmation }
  } catch (err) {
    console.error('サインアップエラー:', err)
    return { success: false, error: '新規登録に失敗しました' }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
