import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clapperboard, MessageCircle, Sparkles, ThumbsUp } from 'lucide-react'

export const metadata: Metadata = {
  title: '使い方 - CineNaito',
  description: 'CineNaitoの基本的な使い方ガイド',
}

export default function GuidePage() {
  return (
    <div className="min-h-screen cinema-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-400 hover:text-cinema-gold transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>

          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-cinema-gradient text-2xl">CineNaitoの使い方</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-300">
              <p>映画の鑑賞予定を共有し、みんなの反応や感想を楽しむためのガイドです。</p>
              <p>まずはログイン後、ダッシュボードから気になる映画を投稿してみましょう。</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Clapperboard className="w-5 h-5 text-cinema-gold" />
                1. 映画を投稿する
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-slate-300">
              <p>「投稿」から映画.comのURLを入力し、作品情報を取得します。</p>
              <p>必要に応じてタイトルやコメントを調整し、鑑賞予定月と期待度を選んで登録します。</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <ThumbsUp className="w-5 h-5 text-cinema-gold" />
                2. リアクションする
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-slate-300">
              <p>気になる投稿には「自分も観る」でリアクションできます。</p>
              <p>一覧では「自分も観るが多い順」などの並び替えも利用できます。</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <MessageCircle className="w-5 h-5 text-cinema-gold" />
                3. 感想をやり取りする
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-slate-300">
              <p>投稿詳細ページで感想コメントを送信できます。</p>
              <p>コメントには絵文字リアクションやコピー機能も使えます。</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Sparkles className="w-5 h-5 text-cinema-gold" />
                便利な使い方
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-slate-300">
              <p>月フィルタを切り替えると、その月に公開される映画や鑑賞予定をすぐ確認できます。</p>
              <p>投稿詳細から編集や削除も可能です（管理者は他ユーザー投稿も管理できます）。</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
