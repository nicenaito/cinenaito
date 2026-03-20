import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Sparkles, 
  ThumbsUp, 
  Plus, 
  Search, 
  Calendar,
  MousePointer2,
  ChevronRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: '使い方 - CineNaito',
  description: 'CineNaitoの基本的な使い方ガイド',
}

export default function GuidePage() {
  return (
    <div className="min-h-screen cinema-bg pb-20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* 戻るボタン */}
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-400 hover:text-cinema-gold transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>

          {/* ヒーローセクション */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-cinema-gradient">CineNaitoへようこそ！</h1>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
              CineNaitoは、映画好きのための公開予定共有アプリです。<br />
              観たい映画をシェアして、仲間と期待感を共有しましょう。
            </p>
          </div>

          {/* ステップ 1: 投稿 */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cinema-gold/20 flex items-center justify-center text-cinema-gold font-bold border border-cinema-gold/30">1</div>
              <h2 className="text-2xl font-bold text-slate-100">映画の情報をシェアする</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>ヘッダーの「投稿」ボタンから、映画.com の作品URLを貼り付けるだけで、タイトルや画像を自動取得します。</p>
                <ul className="space-y-2 list-disc list-inside text-base">
                  <li>URLを入力して「取得」ボタンをクリック</li>
                  <li>期待度（🔥 絶対観る！など）を選択</li>
                  <li>一言コメントを添えて登録完了！</li>
                </ul>
              </div>
              {/* モックアップ: 投稿フォーム */}
              <div className="glass-card rounded-xl p-6 border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cinema-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-3 relative">
                  <div className="h-8 w-full bg-white/5 rounded border border-white/10 flex items-center px-3 gap-2">
                    <Search className="w-3 h-3 text-slate-500" />
                    <div className="h-2 w-32 bg-slate-700 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 flex-1 bg-cinema-gold/20 border border-cinema-gold/30 rounded flex items-center justify-center text-[10px] text-cinema-gold font-bold">情報取得</div>
                  </div>
                  <div className="pt-4 space-y-2 border-t border-white/5">
                    <div className="h-3 w-20 bg-slate-600 rounded-full" />
                    <div className="h-2 w-full bg-slate-700 rounded-full" />
                    <div className="h-2 w-3/4 bg-slate-700 rounded-full" />
                  </div>
                </div>
                <div className="absolute top-4 right-4 animate-bounce">
                  <Plus className="w-8 h-8 text-cinema-gold drop-shadow-[0_0_8px_rgba(212,168,83,0.5)]" />
                </div>
              </div>
            </div>
          </section>

          {/* ステップ 2: チェック */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cinema-gold/20 flex items-center justify-center text-cinema-gold font-bold border border-cinema-gold/30">2</div>
              <h2 className="text-2xl font-bold text-slate-100">公開予定をチェックする</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* モックアップ: ダッシュボード/フィルタ */}
              <div className="glass-card rounded-xl p-6 border-white/10 relative order-2 md:order-1">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <div className="w-12 h-6 bg-cinema-gold/20 rounded border border-cinema-gold/30" />
                    <div className="w-20 h-6 bg-white/5 rounded border border-white/10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/5 space-y-2">
                      <div className="aspect-video bg-slate-800 rounded mb-1" />
                      <div className="h-2 w-full bg-slate-700 rounded-full" />
                      <div className="h-1.5 w-2/3 bg-slate-800 rounded-full" />
                    </div>
                  ))}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-cinema-gold p-2 rounded-full shadow-lg">
                  <Calendar className="w-5 h-5 text-cinema-deep" />
                </div>
              </div>
              <div className="space-y-4 text-slate-300 leading-relaxed order-1 md:order-2">
                <p>ダッシュボードでは、公開年月ごとに映画情報をフィルタリングできます。</p>
                <p>「公開日順」や「投稿順」で並び替えて、旬の情報をキャッチしましょう。</p>
              </div>
            </div>
          </section>

          {/* ステップ 3: リアクション */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cinema-gold/20 flex items-center justify-center text-cinema-gold font-bold border border-cinema-gold/30">3</div>
              <h2 className="text-2xl font-bold text-slate-100">リアクションで盛り上がる</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>気になる映画を見つけたら「自分も観る」ボタンをクリック！</p>
                <p>詳細ページではコメントを残したり、他の人のコメントに絵文字で反応したりできます。</p>
              </div>
              {/* モックアップ: リアクション/コメント */}
              <div className="glass-card rounded-xl p-6 border-white/10 relative group">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700" />
                    <div className="space-y-1">
                      <div className="h-2 w-20 bg-slate-600 rounded-full" />
                      <div className="h-1.5 w-24 bg-slate-800 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-slate-400">これ、予告編から最高でしたね！</p>
                    <div className="flex gap-1 mt-2">
                      <div className="px-1.5 py-0.5 bg-white/5 rounded text-xs">🔥 3</div>
                      <div className="px-1.5 py-0.5 bg-white/5 rounded text-xs">👏 1</div>
                    </div>
                  </div>
                  <div className="flex justify-center pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cinema-gold/10 border border-cinema-gold/40 text-cinema-gold font-bold text-sm group-hover:bg-cinema-gold/20 transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                      自分も観る！
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 right-1/4 animate-pulse">
                  <MousePointer2 className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          </section>

          {/* Tips セクション */}
          <Card className="glass-card border-cinema-gold/20 bg-cinema-gold/5">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-start">
                <Sparkles className="w-6 h-6 text-cinema-gold shrink-0 mt-1" />
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-cinema-gold">知っていると便利な機能</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-slate-200 font-semibold text-base flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> URLの自動取得
                      </p>
                      <p className="text-sm text-slate-400">映画.com 以外の URL でも、可能な限り情報を読み取ります。</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-200 font-semibold text-base flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> 管理者機能
                      </p>
                      <p className="text-sm text-slate-400">間違えて投稿しても、管理者ならいつでも整理が可能です。</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* フッター誘導 */}
          <div className="text-center pt-8">
            <Link href="/dashboard">
              <Button size="lg" className="btn-cinema px-12 rounded-full text-lg h-14">
                さっそく使ってみる
              </Button>
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
