'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleReaction, addComment, deleteComment } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popcorn, Send, Trash2, Loader2, Copy, Check, MessageCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/helpers'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

interface PlanDetailClientProps {
  planId: string
  currentUserId?: string
  isAdmin: boolean
  isLoggedIn: boolean
  initialReacted: boolean
  initialReactionCount: number
  comments: Comment[]
}

export function PlanDetailClient({
  planId,
  currentUserId,
  isAdmin,
  isLoggedIn,
  initialReacted,
  initialReactionCount,
  comments: initialComments,
}: PlanDetailClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [reacted, setReacted] = useState(initialReacted)
  const [reactionCount, setReactionCount] = useState(initialReactionCount)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // サーバーから最新データが渡されたら同期
  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  // 新しいコメントが追加されたら自動スクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

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
    // Ctrl+Enter or Cmd+Enter で送信
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
      toast.success('コメントを削除しました')
    } else {
      toast.error(result.error)
    }
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

      {/* チャット風コメントセクション */}
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
          {/* チャットメッセージ一覧 */}
          <div className="max-h-[480px] overflow-y-auto space-y-1 pb-4 scrollbar-thin">
            {comments.length > 0 ? (
              comments.map((comment) => {
                const isOwnComment = comment.user_id === currentUserId
                return (
                  <div
                    key={comment.id}
                    className={cn(
                      'flex gap-2.5 group py-2 px-2 rounded-lg transition-colors hover:bg-white/[0.03]',
                      isOwnComment ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* アバター */}
                    <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-cinema-gold/15 mt-0.5">
                      <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-cinema-gold/15 text-cinema-gold text-xs font-medium">
                        {(comment.profiles?.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* メッセージ本体 */}
                    <div className={cn('max-w-[75%] min-w-0', isOwnComment ? 'items-end' : 'items-start')}>
                      <div className={cn('flex items-center gap-2 mb-1', isOwnComment ? 'flex-row-reverse' : 'flex-row')}>
                        <span className="text-xs font-medium text-slate-300">
                          {comment.profiles?.username || 'ユーザー'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
                          isOwnComment
                            ? 'bg-cinema-gold/15 text-slate-100 rounded-tr-sm'
                            : 'bg-white/[0.07] text-slate-200 rounded-tl-sm'
                        )}
                      >
                        {comment.content}
                      </div>
                      {/* アクションボタン */}
                      <div className={cn(
                        'flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
                        isOwnComment ? 'justify-end' : 'justify-start'
                      )}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyComment(comment)}
                          className="text-slate-500 hover:text-cinema-gold-light p-1 h-auto transition-colors"
                          title="コピー"
                        >
                          {copiedId === comment.id ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        {(comment.user_id === currentUserId || isAdmin) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-slate-500 hover:text-red-400 p-1 h-auto transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
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

          {/* 入力エリア */}
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
