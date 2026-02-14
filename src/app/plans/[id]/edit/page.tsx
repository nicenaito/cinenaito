import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { EditPlanClient } from './edit-plan-client'
import { getIsAdmin } from '@/lib/admin'

export const metadata: Metadata = {
  title: '投稿編集 - CineNaito',
}

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = await params

  if (!user) {
    redirect(`/login?next=/plans/${id}/edit`)
  }

  const isAdmin = await getIsAdmin(supabase, user.id)

  const { data: plan, error } = await supabase
    .from('movie_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !plan) {
    notFound()
  }

  if (plan.user_id !== user.id && !isAdmin) {
    redirect(`/plans/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href={`/plans/${id}`}>
            <Button variant="ghost" className="mb-6 text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              投稿詳細に戻る
            </Button>
          </Link>
          <EditPlanClient
            planId={id}
            defaultValues={{
              title: plan.title,
              release_date: plan.release_date || '',
              movie_url: plan.movie_url || '',
              youtube_url: plan.youtube_url || '',
              comment: plan.comment || '',
              expectation: plan.expectation,
              target_month: plan.target_month,
            }}
          />
        </div>
      </main>
    </div>
  )
}
