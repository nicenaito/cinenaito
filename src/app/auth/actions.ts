'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

function resolveNextPath(nextPath?: string | null) {
  if (!nextPath) return '/dashboard'
  if (nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    return nextPath
  }
  return '/dashboard'
}

/**
 * ユーザー名からSupabase Auth用のダミーメールを生成
 * ユーザーにはメールアドレスを一切見せない
 */
function usernameToEmail(username: string): string {
  const encoded = Buffer.from(username, 'utf-8').toString('base64url')
  return `${encoded}@cinenaito.local`
}

export async function signInWithPassword(
  username: string,
  password: string,
  nextPath?: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const email = usernameToEmail(username)

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error('ログインエラー:', signInError)
    return { success: false, error: 'ユーザー名またはパスワードが違います' }
  }

  if (!data.user) {
    return { success: false, error: 'ログインに失敗しました' }
  }

  redirect(resolveNextPath(nextPath))
}

export async function signUpWithPassword(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const email = usernameToEmail(username)

  try {
    // ユーザー名の重複チェック
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'このユーザー名は既に使用されています' }
    }

    // 管理者APIでユーザーを作成（メール確認不要）
    const adminClient = createAdminClient()
    const { error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: username,
      },
    })

    if (createError) {
      console.error('サインアップエラー:', createError)
      if (createError.message?.includes('already been registered')) {
        return { success: false, error: 'このユーザー名は既に使用されています' }
      }
      return { success: false, error: '新規登録に失敗しました' }
    }

    // 作成したユーザーでログイン
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('自動ログインエラー:', signInError)
      return { success: false, error: '登録は完了しました。ログインページからログインしてください。' }
    }

    return { success: true }
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
