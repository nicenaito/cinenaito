'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { moviePlanSchema, MoviePlanFormData } from '@/lib/validations'
import { generateMonthOptions, getCurrentMonth } from '@/lib/helpers'
import { fetchMovieInfoFromEiga } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Film, Search } from 'lucide-react'

interface MovieFormProps {
  onSubmit: (data: MoviePlanFormData) => Promise<void>
  isSubmitting?: boolean
  defaultValues?: Partial<MoviePlanFormData>
  title?: string
  submitLabel?: string
}

export function MovieForm({
  onSubmit,
  isSubmitting,
  defaultValues,
  title = '映画情報を登録',
  submitLabel = '登録する',
}: MovieFormProps) {
  const monthOptions = generateMonthOptions()
  const [isFetchingInfo, setIsFetchingInfo] = useState(false)

  const form = useForm<MoviePlanFormData>({
    resolver: zodResolver(moviePlanSchema),
    defaultValues: {
      movie_url: '',
      title: '',
      release_date: '',
      youtube_url: '',
      comment: '',
      expectation: '気にはなっている',
      target_month: getCurrentMonth(),
      ...defaultValues,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
  })

  const handleFetchMovieInfo = async () => {
    const movieUrl = form.getValues('movie_url')?.trim()

    if (!movieUrl) {
      form.setError('movie_url', { message: '映画.com URLを入力してください' })
      return
    }

    setIsFetchingInfo(true)
    try {
      const result = await fetchMovieInfoFromEiga(movieUrl)

      if (!result.success) {
        form.setError('movie_url', { message: result.error || '情報取得に失敗しました' })
        return
      }

      form.clearErrors('movie_url')
      form.setValue('title', result.title ?? '', { shouldDirty: true, shouldValidate: true })
      form.setValue('release_date', result.releaseDate ?? '', { shouldDirty: true })
    } finally {
      setIsFetchingInfo(false)
    }
  }

  const currentTitle = form.watch('title')
  const currentReleaseDate = form.watch('release_date')

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cinema-gradient">
          <Film className="w-5 h-5 text-cinema-gold" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" {...form.register('release_date')} />

            {/* 映画.com URL */}
            <FormField
              control={form.control}
              name="movie_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">映画.com URL *</FormLabel>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <FormControl>
                      <Input
                        placeholder="https://eiga.com/movie/..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cinema-gold/50"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleFetchMovieInfo}
                      disabled={isFetchingInfo}
                      className="sm:w-auto bg-white/10 hover:bg-cinema-gold/20 border-white/10 text-slate-200 hover:text-cinema-gold-light transition-all"
                    >
                      {isFetchingInfo ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          取得中
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          情報を取得
                        </>
                      )}
                    </Button>
                  </div>
                  <FormDescription className="text-slate-500">
                    まず映画.comの作品ページURLを入力し、「情報を取得」を押してください。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(currentTitle || currentReleaseDate) && (
              <div className="rounded-lg border border-cinema-gold/20 bg-cinema-gold/5 p-4 space-y-2">
                <p className="text-xs text-cinema-gold font-medium">取得結果</p>
                {currentTitle && <p className="text-sm text-slate-100">タイトル: {currentTitle}</p>}
                {currentReleaseDate && (
                  <p className="text-sm text-slate-100">公開日: {currentReleaseDate}</p>
                )}
              </div>
            )}

            {/* 映画タイトル */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">映画タイトル *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="URLから自動取得されます（必要なら編集可）"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cinema-gold/50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500">
                    情報取得に失敗した場合は手入力できます
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 対象月 */}
            <FormField
              control={form.control}
              name="target_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">鑑賞予定月 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white hover:border-cinema-gold/30 transition-colors">
                        <SelectValue placeholder="月を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-card border-white/10">
                      {monthOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-white hover:bg-cinema-gold/10 focus:bg-cinema-gold/10 focus:text-white"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 期待度 */}
            <FormField
              control={form.control}
              name="expectation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">期待度 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white hover:border-cinema-gold/30 transition-colors">
                        <SelectValue placeholder="期待度を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-card border-white/10">
                      <SelectItem value="絶対観る" className="text-white hover:bg-cinema-gold/10 focus:bg-cinema-gold/10 focus:text-white">
                        🔥 絶対観る
                      </SelectItem>
                      <SelectItem value="時間が合えば" className="text-white hover:bg-cinema-gold/10 focus:bg-cinema-gold/10 focus:text-white">
                        ⏰ 時間が合えば
                      </SelectItem>
                      <SelectItem value="気にはなっている" className="text-white hover:bg-cinema-gold/10 focus:bg-cinema-gold/10 focus:text-white">
                        👀 気にはなっている
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* YouTube URL */}
            <FormField
              control={form.control}
              name="youtube_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">YouTube予告編URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cinema-gold/50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500">
                    予告編の埋め込み表示に使用されます
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* コメント */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">コメント</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="期待ポイントや一緒に観たい人など..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cinema-gold/50 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 送信ボタン */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-cinema rounded-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  登録中...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
