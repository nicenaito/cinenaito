'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { moviePlanSchema, MoviePlanFormData } from '@/lib/validations'
import { generateMonthOptions, getCurrentMonth } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Loader2, Film } from 'lucide-react'

interface MovieFormProps {
  onSubmit: (data: MoviePlanFormData) => Promise<void>
  isSubmitting?: boolean
  defaultValues?: Partial<MoviePlanFormData>
}

export function MovieForm({ onSubmit, isSubmitting, defaultValues }: MovieFormProps) {
  const monthOptions = generateMonthOptions()

  const form = useForm<MoviePlanFormData>({
    resolver: zodResolver(moviePlanSchema),
    defaultValues: {
      title: '',
      movie_url: '',
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

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Film className="w-5 h-5" />
          映画情報を登録
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 映画タイトル */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">映画タイトル *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例: オッペンハイマー"
                      className="bg-slate-900 border-slate-600 text-white"
                      {...field}
                    />
                  </FormControl>
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
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue placeholder="月を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {monthOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-white hover:bg-slate-700"
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
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue placeholder="期待度を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="絶対観る" className="text-white hover:bg-slate-700">
                        🔥 絶対観る
                      </SelectItem>
                      <SelectItem value="時間が合えば" className="text-white hover:bg-slate-700">
                        ⏰ 時間が合えば
                      </SelectItem>
                      <SelectItem value="気にはなっている" className="text-white hover:bg-slate-700">
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
                      className="bg-slate-900 border-slate-600 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-slate-400">
                    予告編の埋め込み表示に使用されます
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 映画.com URL */}
            <FormField
              control={form.control}
              name="movie_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">映画.com URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://eiga.com/movie/..."
                      className="bg-slate-900 border-slate-600 text-white"
                      {...field}
                    />
                  </FormControl>
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
                      className="bg-slate-900 border-slate-600 text-white min-h-[100px]"
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
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  登録中...
                </>
              ) : (
                '登録する'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
