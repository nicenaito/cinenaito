'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MoviePlanFormData, commentSchema } from '@/lib/validations'
import { Database } from '@/types/database.types'
import { getIsAdmin } from '@/lib/admin'
import { extractYearMonthFromReleaseDate } from '@/lib/helpers'

type MoviePlanInsert = Database['public']['Tables']['movie_plans']['Insert']
type MoviePlanUpdate = Database['public']['Tables']['movie_plans']['Update']
type ReactionInsert = Database['public']['Tables']['reactions']['Insert']
type CommentInsert = Database['public']['Tables']['plan_comments']['Insert']

function isValidEigaUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl)
    const isEigaDomain = /(^|\.)eiga\.com$/i.test(parsed.hostname)
    const isMoviePath = parsed.pathname.startsWith('/movie/')
    return isEigaDomain && isMoviePath
  } catch {
    return false
  }
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function normalizeEigaMovieTitle(rawTitle: string) {
  return rawTitle
    .replace(/^\s*タイトル\s*[：:]\s*/i, '')
    .replace(/\s*[\-|｜|]\s*映画\.com.*$/i, '')
    .replace(/\s*\(映画\.com\)\s*$/i, '')
    .replace(/\s*[：:]\s*作品情報.*$/i, '')
    .replace(/\s*[：:]\s*キャスト.*$/i, '')
    .replace(/\s*[：:]\s*あらすじ.*$/i, '')
    .replace(/\s*[：:]\s*動画.*$/i, '')
    .trim()
}

function extractMetaContent(html: string, propertyName: string) {
  const escaped = propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${escaped}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]*name=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      return decodeHtmlEntities(match[1])
    }
  }

  return null
}

function extractReleaseDate(html: string) {
  const fromIsoDate = html.match(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})"/i)
  if (fromIsoDate?.[1]) {
    const [year, month, day] = fromIsoDate[1].split('-').map(Number)
    return `${year}年${month}月${day}日`
  }

  const japaneseDatePattern =
    /(公開日|公開予定日|公開)\s*[:：]?\s*(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/
  const japaneseDate = html.match(japaneseDatePattern)
  if (japaneseDate?.[2] && japaneseDate?.[3] && japaneseDate?.[4]) {
    return `${Number(japaneseDate[2])}年${Number(japaneseDate[3])}月${Number(japaneseDate[4])}日`
  }

  return null
}

function extractDescription(html: string) {
  return (
    extractMetaContent(html, 'og:description') ||
    extractMetaContent(html, 'twitter:description') ||
    extractMetaContent(html, 'description')
  )
}

function extractImageUrl(html: string, pageUrl: string) {
  const rawImage =
    extractMetaContent(html, 'og:image') ||
    extractMetaContent(html, 'twitter:image')

  if (!rawImage) return null

  try {
    return new URL(rawImage, pageUrl).toString()
  } catch {
    return null
  }
}

async function fetchEigaHtml(movieUrl: string) {
  const response = await fetch(movieUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return { success: false as const, error: '映画.comから情報を取得できませんでした' }
  }

  const html = await response.text()
  return { success: true as const, html }
}

export async function fetchMovieInfoFromEiga(movieUrl: string) {
  if (!isValidEigaUrl(movieUrl)) {
    return {
      success: false,
      error: '映画.comの作品ページURL（https://eiga.com/movie/...）を入力してください',
    }
  }

  try {
    const fetched = await fetchEigaHtml(movieUrl)
    if (!fetched.success) {
      return fetched
    }

    const { html } = fetched

    const rawTitle =
      extractMetaContent(html, 'og:title') ||
      extractMetaContent(html, 'twitter:title') ||
      html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ||
      null

    if (!rawTitle) {
      return { success: false, error: 'タイトルを取得できませんでした' }
    }

    const title = normalizeEigaMovieTitle(rawTitle)

    if (!title) {
      return { success: false, error: 'タイトルを取得できませんでした' }
    }

    const releaseDate = extractReleaseDate(html)

    return {
      success: true,
      title,
      releaseDate,
    }
  } catch (error) {
    console.error('映画.com情報取得エラー:', error)
    return { success: false, error: '映画情報の取得に失敗しました' }
  }
}

export async function fetchMoviePreviewFromEiga(movieUrl: string) {
  if (!isValidEigaUrl(movieUrl)) {
    return {
      success: false,
      error: '映画.comの作品ページURL（https://eiga.com/movie/...）を入力してください',
    }
  }

  try {
    const fetched = await fetchEigaHtml(movieUrl)
    if (!fetched.success) {
      return fetched
    }

    const { html } = fetched
    const rawTitle =
      extractMetaContent(html, 'og:title') ||
      extractMetaContent(html, 'twitter:title') ||
      html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ||
      null

    if (!rawTitle) {
      return { success: false, error: 'タイトルを取得できませんでした' }
    }

    const title = normalizeEigaMovieTitle(rawTitle)

    if (!title) {
      return { success: false, error: 'タイトルを取得できませんでした' }
    }

    return {
      success: true,
      title,
      releaseDate: extractReleaseDate(html),
      description: extractDescription(html),
      imageUrl: extractImageUrl(html, movieUrl),
      movieUrl,
    }
  } catch (error) {
    console.error('映画.comプレビュー取得エラー:', error)
    return { success: false, error: '映画情報の取得に失敗しました' }
  }
}

export async function createMoviePlan(data: MoviePlanFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '認証が必要です' }
  }

  const insertData: MoviePlanInsert = {
    user_id: user.id,
    title: data.title,
    release_date: data.release_date || null,
    release_month: extractYearMonthFromReleaseDate(data.release_date || null) || data.target_month,
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

export async function updateMoviePlan(planId: string, data: MoviePlanFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '認証が必要です' }
  }

  const isAdmin = await getIsAdmin(supabase, user.id)
  const updateData: MoviePlanUpdate = {
    title: data.title,
    release_date: data.release_date || null,
    release_month: extractYearMonthFromReleaseDate(data.release_date || null) || data.target_month,
    movie_url: data.movie_url || null,
    youtube_url: data.youtube_url || null,
    comment: data.comment || null,
    expectation: data.expectation,
    target_month: data.target_month,
  }

  const updateQuery = supabase
    .from('movie_plans')
    .update(updateData)
    .eq('id', planId)

  const { error } = isAdmin
    ? await updateQuery
    : await updateQuery.eq('user_id', user.id)

  if (error) {
    console.error('更新エラー:', error)
    return { success: false, error: '更新に失敗しました' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
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

  const parsed = commentSchema.safeParse({ content })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'コメントが不正です' }
  }

  const insertData: CommentInsert = {
    plan_id: planId,
    user_id: user.id,
    content: parsed.data.content,
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
