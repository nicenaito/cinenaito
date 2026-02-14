'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MovieForm } from '@/components/movie-form'
import { createMoviePlan } from '@/app/actions'
import { MoviePlanFormData } from '@/lib/validations'
import { toast } from 'sonner'

export function NewPlanClient() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: MoviePlanFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createMoviePlan(data)
      if (result.success) {
        toast.success('映画鑑賞予定を登録しました！')
        router.push('/dashboard')
      } else {
        toast.error(result.error || '登録に失敗しました')
      }
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return <MovieForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
}
