'use client'

import { useState, useEffect, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleReaction, addComment, deleteComment } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popcorn, Send, Trash2, Loader2 } from 'lucide-react'
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

  // サーバーから最新データが渡されたら同期
  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

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
    try {
      const result = await addComment(planId, newComment.trim())
      if (result.success) {
        setNewComment('')
        toast.success('コメントを投稿しました')
        // サーバーから最新のコメント一覧を再取得
        router.refresh()
      } else {
        setComments((prev) => prev.filter((c) => c.id !== tempId))
        toast.error(result.error)
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== tempId))
      toast.error('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
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

      {/* コメントセクション */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            コメント ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* コメント一覧 */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-cinema-gold/15">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-cinema-gold/15 text-cinema-gold text-xs font-medium">
                      {(comment.profiles?.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200">
                        {comment.profiles?.username || 'ユーザー'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                      {(comment.user_id === currentUserId || isAdmin) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="ml-auto text-slate-500 hover:text-red-400 p-1 h-auto transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">
              まだコメントはありません
            </p>
          )}

          {/* コメント入力 */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <Textarea
              placeholder="コメントを入力..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cinema-gold/50 min-h-[80px]"
              disabled={!isLoggedIn}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim() || !isLoggedIn}
              className="btn-cinema self-end rounded-lg"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {!isLoggedIn && (
            <p className="text-sm text-slate-400">
              コメントやリアクションには{' '}
              <Link href={`/login?next=${encodeURIComponent(pathname || `/plans/${planId}`)}`} className="text-cinema-gold hover:text-cinema-gold-light transition-colors">
                ログイン
              </Link>
              が必要です。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
