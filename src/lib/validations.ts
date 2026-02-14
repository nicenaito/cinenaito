import { z } from 'zod'

const urlPattern = /^https?:\/\/.+/
const eigaUrlPattern = /^https?:\/\/(?:www\.)?eiga\.com\/movie\/.+/

export const moviePlanSchema = z.object({
  title: z
    .string()
    .min(1, '映画タイトルは必須です')
    .max(200, '映画タイトルは200文字以内で入力してください'),
  movie_url: z
    .string()
    .min(1, '映画.com URLは必須です')
    .refine(
      (val) => urlPattern.test(val),
      '有効なURLを入力してください'
    )
    .refine(
      (val) => eigaUrlPattern.test(val),
      '映画.comの作品ページURL（https://eiga.com/movie/...）を入力してください'
    ),
  youtube_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || urlPattern.test(val),
      '有効なURLを入力してください'
    )
    .refine(
      (val) => !val || val.includes('youtube.com') || val.includes('youtu.be'),
      'YouTube URLを入力してください'
    ),
  comment: z
    .string()
    .max(1000, 'コメントは1000文字以内で入力してください')
    .optional(),
  expectation: z.enum(['絶対観る', '時間が合えば', '気にはなっている']),
  target_month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'YYYY-MM形式で入力してください'),
})

export type MoviePlanFormData = z.infer<typeof moviePlanSchema>

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'コメントを入力してください')
    .max(500, 'コメントは500文字以内で入力してください'),
})

export type CommentFormData = z.infer<typeof commentSchema>
