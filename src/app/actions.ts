'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MoviePlanFormData } from '@/lib/validations'
import { Database } from '@/types/database.types'
import { getIsAdmin } from '@/lib/admin'

type MoviePlanInsert = Database['public']['Tables']['movie_plans']['Insert']
type ReactionInsert = Database['public']['Tables']['reactions']['Insert']
type CommentInsert = Database['public']['Tables']['plan_comments']['Insert']

export async function createMoviePlan(data: MoviePlanFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '認証が必要です' }
  }

  const insertData: MoviePlanInsert = {
    user_id: user.id,
    title: data.title,
    movie_url: data.movie_url || null,
    youtube_url: data.youtube_url || null,
    comment: data.comment || null,
    expectation: data.expectation,
    target_month: data.target_month,
  }

  const { error } = await supabase.from('movie_plans').insert(insertData)

  if (error) {
    console.error('投稿エラー:', error)
    return { success: false, error: '投稿に失敗しました' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteMoviePlan(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '認証が必要です' }
  }

  const isAdmin = await getIsAdmin(supabase, user.id)

  const deleteQuery = supabase
    .from('movie_plans')
    .delete()
    .eq('id', planId)

  const { error } = isAdmin
    ? await deleteQuery
    : await deleteQuery.eq('user_id', user.id)

  if (error) {
    console.error('削除エラー:', error)
    return { success: false, error: '削除に失敗しました' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleReaction(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, reacted: false, error: '認証が必要です' }
  }

  // 既存のリアクションをチェック
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('plan_id', planId)
    .eq('user_id', user.id)
    .maybeSingle()

  const existingReaction = existing as { id: string } | null
  if (existingReaction) {
    // リアクションを削除
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('id', existingReaction.id)

    if (error) {
      return { success: false, reacted: true, error: 'リアクション解除に失敗しました' }
    }

    revalidatePath('/dashboard')
    return { success: true, reacted: false }
  } else {
    // リアクションを追加
    const insertData: ReactionInsert = {
      plan_id: planId,
      user_id: user.id,
    }
    const { error } = await supabase.from('reactions').insert(insertData)

    if (error) {
      return { success: false, reacted: false, error: 'リアクション追加に失敗しました' }
    }

    revalidatePath('/dashboard')
    return { success: true, reacted: true }
  }
}

export async function addComment(planId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '認証が必要です' }
  }

  const insertData: CommentInsert = {
    plan_id: planId,
    user_id: user.id,
    content,
  }
  const { error } = await supabase.from('plan_comments').insert(insertData)

  if (error) {
    console.error('コメントエラー:', error)
    return { success: false, error: 'コメント投稿に失敗しました' }
  }

  revalidatePath(`/plans/${planId}`)
  return { success: true }
}

export async function deleteComment(commentId: string, planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '認証が必要です' }
  }

  const isAdmin = await getIsAdmin(supabase, user.id)

  const deleteQuery = supabase
    .from('plan_comments')
    .delete()
    .eq('id', commentId)

  const { error } = isAdmin
    ? await deleteQuery
    : await deleteQuery.eq('user_id', user.id)

  if (error) {
    console.error('コメント削除エラー:', error)
    return { success: false, error: 'コメント削除に失敗しました' }
  }

  revalidatePath(`/plans/${planId}`)
  return { success: true }
}
