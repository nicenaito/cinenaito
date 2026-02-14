'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MovieForm } from '@/components/movie-form'
import { updateMoviePlan } from '@/app/actions'
import { MoviePlanFormData } from '@/lib/validations'
import { toast } from 'sonner'

interface EditPlanClientProps {
  planId: string
  defaultValues: Partial<MoviePlanFormData>
}

export function EditPlanClient({ planId, defaultValues }: EditPlanClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: MoviePlanFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateMoviePlan(planId, data)
      if (result.success) {
        toast.success('投稿を更新しました')
        router.push(`/plans/${planId}`)
      } else {
        toast.error(result.error || '更新に失敗しました')
      }
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MovieForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      defaultValues={defaultValues}
      title="映画情報を編集"
      submitLabel="更新する"
    />
  )
}
