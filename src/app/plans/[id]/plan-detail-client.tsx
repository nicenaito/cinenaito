'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleReaction, addComment, deleteComment, toggleCommentReaction } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popcorn, Send, Trash2, Loader2, Copy, Check, MessageCircle, SmilePlus } from 'lucide-react'
import { formatRelativeTime } from '@/lib/helpers'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ALLOWED_EMOJIS = ['👍', '😂', '❤️', '🎬', '🔥', '👀'] as const

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  } | null
}

interface CommentReactionData {
  comment_id: string
  emoji: string
  user_id: string
}

interface PlanDetailClientProps {
  planId: string
  currentUserId?: string
  isAdmin: boolean
  isLoggedIn: boolean
  initialReacted: boolean
  initialReactionCount: number
  comments: Comment[]
  commentReactions: CommentReactionData[]
}

// 連続メッセージかどうか判定（同じユーザーで5分以内）
function shouldGroupWithPrevious(current: Comment, previous: Comment | undefined): boolean {
  if (!previous) return false
  if (current.user_id !== previous.user_id) return false
  const diff = new Date(current.created_at).getTime() - new Date(previous.created_at).getTime()
  return diff < 5 * 60 * 1000
}

export function PlanDetailClient({
  planId,
  currentUserId,
  isAdmin,
  isLoggedIn,
  initialReacted,
  initialReactionCount,
  comments: initialComments,
  commentReactions: initialCommentReactions,
}: PlanDetailClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [reacted, setReacted] = useState(initialReacted)
  const [reactionCount, setReactionCount] = useState(initialReactionCount)
  const [comments, setComments] = useState(initialComments)
  const [commentReactions, setCommentReactions] = useState(initialCommentReactions)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [emojiPickerOpenId, setEmojiPickerOpenId] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  useEffect(() => {
    setCommentReactions(initialCommentReactions)
  }, [initialCommentReactions])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  // 絵文字ピッカー外クリックで閉じる
  useEffect(() => {
    if (!emojiPickerOpenId) return
    const handleClick = () => setEmojiPickerOpenId(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [emojiPickerOpenId])

  const handleRequireLogin = () => {
    toast.error('ログインが必要です')
    const next = pathname || `/plans/${planId}`
    router.push(`/login?next=${encodeURIComponent(next)}`)
  }

  const handleReaction = () => {
    if (!isLoggedIn) {
      handleRequireLogin()
      return
    }
    const newReacted = !reacted
    const newCount = newReacted ? reactionCount + 1 : reactionCount - 1
    setReacted(newReacted)
    setReactionCount(newCount)

    startTransition(async () => {
      const result = await toggleReaction(planId)
      if (!result.success) {
        setReacted(!newReacted)
        setReactionCount(reactionCount)
        toast.error(result.error)
      }
    })
  }

  const handleCopyComment = async (comment: Comment) => {
    const text = `${comment.profiles?.username || 'ユーザー'}: ${comment.content}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(comment.id)
      toast.success('コピーしました')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('コピーに失敗しました')
    }
  }

  const handleCopyAllComments = async () => {
    if (comments.length === 0) return
    const text = comments
      .map((c) => `${c.profiles?.username || 'ユーザー'}: ${c.content}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast.success('全コメントをコピーしました')
    } catch {
      toast.error('コピーに失敗しました')
    }
  }

  const handleSubmitComment = async () => {
    if (!isLoggedIn || !currentUserId) {
      handleRequireLogin()
      return
    }
    if (!newComment.trim()) return

    setIsSubmitting(true)
    const tempId = `temp-${Date.now()}`
    const optimisticComment: Comment = {
      id: tempId,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      profiles: {
        username: 'あなた',
        avatar_url: null,
      },
    }
    setComments((prev) => [...prev, optimisticComment])
    const commentText = newComment.trim()
    setNewComment('')
    try {
      const result = await addComment(planId, commentText)
      if (result.success) {
        router.refresh()
      } else {
        setComments((prev) => prev.filter((c) => c.id !== tempId))
        setNewComment(commentText)
        toast.error(result.error)
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== tempId))
      setNewComment(commentText)
      toast.error('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('コメントを削除しますか？')) return

    const result = await deleteComment(commentId, planId)
    if (result.success) {
      setComments(comments.filter((c) => c.id !== commentId))
      setCommentReactions(commentReactions.filter((r) => r.comment_id !== commentId))
      toast.success('コメントを削除しました')
    } else {
      toast.error(result.error)
    }
  }

  const handleCommentReaction = async (commentId: string, emoji: string) => {
    if (!isLoggedIn || !currentUserId) {
      handleRequireLogin()
      return
    }

    const existing = commentReactions.find(
      (r) => r.comment_id === commentId && r.emoji === emoji && r.user_id === currentUserId
    )

    // 楽観的更新
    if (existing) {
      setCommentReactions((prev) =>
        prev.filter((r) => !(r.comment_id === commentId && r.emoji === emoji && r.user_id === currentUserId))
      )
    } else {
      setCommentReactions((prev) => [
        ...prev,
        { comment_id: commentId, emoji, user_id: currentUserId },
      ])
    }

    setEmojiPickerOpenId(null)

    const result = await toggleCommentReaction(commentId, emoji)
    if (!result.success) {
      // ロールバック
      if (existing) {
        setCommentReactions((prev) => [
          ...prev,
          { comment_id: commentId, emoji, user_id: currentUserId },
        ])
      } else {
        setCommentReactions((prev) =>
          prev.filter((r) => !(r.comment_id === commentId && r.emoji === emoji && r.user_id === currentUserId))
        )
      }
      toast.error(result.error)
    }
  }

  // コメントのリアクション集計
  const getReactionSummary = (commentId: string) => {
    const reactions = commentReactions.filter((r) => r.comment_id === commentId)
    const grouped: Record<string, { count: number; reacted: boolean }> = {}
    for (const r of reactions) {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = { count: 0, reacted: false }
      }
      grouped[r.emoji].count++
      if (r.user_id === currentUserId) {
        grouped[r.emoji].reacted = true
      }
    }
    return grouped
  }

  return (
    <div className="mt-6 space-y-6">
      {/* リアクションボタン */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handleReaction}
          disabled={isPending}
          className={cn(
            'gap-2 transition-all duration-200',
            reacted
              ? 'border-cinema-gold/50 text-cinema-gold hover:bg-cinema-gold/10'
              : 'border-white/10 text-slate-400 hover:text-cinema-gold-light hover:border-cinema-gold/30'
          )}
        >
          <Popcorn className={cn('w-5 h-5 transition-transform', reacted && 'fill-current scale-110')} />
          自分も観る
          {reactionCount > 0 && <span>({reactionCount})</span>}
        </Button>
      </div>

      {/* Discord風コメントセクション */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cinema-gold" />
              みんなの感想 ({comments.length})
            </CardTitle>
            {comments.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAllComments}
                className="text-slate-400 hover:text-cinema-gold-light text-xs gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                全てコピー
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-0">
          {/* Discord風メッセージ一覧 */}
          <div className="max-h-[480px] overflow-y-auto pb-4 scrollbar-thin">
            {comments.length > 0 ? (
              comments.map((comment, index) => {
                const isGrouped = shouldGroupWithPrevious(comment, comments[index - 1])
                const reactionSummary = getReactionSummary(comment.id)
                const hasReactions = Object.keys(reactionSummary).length > 0

                return (
                  <div
                    key={comment.id}
                    className={cn(
                      'group relative flex gap-4 px-4 py-0.5 hover:bg-white/[0.03] transition-colors',
                      !isGrouped && index > 0 && 'mt-4',
                      !isGrouped && 'pt-2'
                    )}
                  >
                    {/* アバター or スペーサー */}
                    <div className="w-10 flex-shrink-0">
                      {!isGrouped && (
                        <Avatar className="w-10 h-10 ring-1 ring-cinema-gold/15">
                          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="bg-cinema-gold/15 text-cinema-gold text-sm font-medium">
                            {(comment.profiles?.username || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* メッセージ本体 */}
                    <div className="flex-1 min-w-0">
                      {/* ユーザー名 + タイムスタンプ（グループ最初のみ） */}
                      {!isGrouped && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-200 hover:underline cursor-default">
                            {comment.profiles?.username || 'ユーザー'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                        </div>
                      )}

                      {/* メッセージ本文 */}
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>

                      {/* 絵文字リアクションバッジ */}
                      {hasReactions && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Object.entries(reactionSummary).map(([emoji, { count, reacted: userReacted }]) => (
                            <button
                              key={emoji}
                              onClick={() => handleCommentReaction(comment.id, emoji)}
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all border',
                                userReacted
                                  ? 'bg-cinema-gold/15 border-cinema-gold/40 text-cinema-gold'
                                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/[0.07]'
                              )}
                            >
                              <span>{emoji}</span>
                              <span className="font-medium">{count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Discord風 ホバーアクションツールバー */}
                    <div className="absolute right-2 -top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="flex items-center bg-cinema-surface border border-white/10 rounded-md shadow-lg">
                        {/* 絵文字ピッカートグル */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEmojiPickerOpenId(emojiPickerOpenId === comment.id ? null : comment.id)
                            }}
                            className="p-1.5 text-slate-400 hover:text-cinema-gold-light transition-colors"
                            title="リアクション"
                          >
                            <SmilePlus className="w-4 h-4" />
                          </button>
                          {emojiPickerOpenId === comment.id && (
                            <div
                              className="absolute right-0 bottom-full mb-1 bg-cinema-surface border border-white/10 rounded-lg shadow-xl p-2 flex gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {ALLOWED_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleCommentReaction(comment.id, emoji)}
                                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopyComment(comment)}
                          className="p-1.5 text-slate-400 hover:text-cinema-gold-light transition-colors"
                          title="コピー"
                        >
                          {copiedId === comment.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        {(comment.user_id === currentUserId || isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-10">
                <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  まだ感想はありません。最初のひとことを投稿しましょう！
                </p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Discord風 入力エリア */}
          <div className="border-t border-white/5 pt-4">
            {isLoggedIn ? (
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    placeholder="感想を送信... (Ctrl+Enterで送信)"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cinema-gold/50 min-h-[44px] max-h-[120px] resize-none rounded-xl pr-3"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className="btn-cinema rounded-xl h-[44px] w-[44px] p-0 flex-shrink-0"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-sm text-slate-400">
                  感想を投稿するには{' '}
                  <Link href={`/login?next=${encodeURIComponent(pathname || `/plans/${planId}`)}`} className="text-cinema-gold hover:text-cinema-gold-light transition-colors font-medium">
                    ログイン
                  </Link>
                  {' '}してください
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
