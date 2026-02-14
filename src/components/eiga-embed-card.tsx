'use client'

import { useState } from 'react'
import { fetchMoviePreviewFromEiga } from '@/app/actions'
import { ExternalLink, Loader2 } from 'lucide-react'

interface EigaEmbedCardProps {
  movieUrl: string
  title: string
}

interface MoviePreview {
  title: string
  releaseDate: string | null
  description: string | null
  imageUrl: string | null
  movieUrl: string
}

export function EigaEmbedCard({ movieUrl, title }: EigaEmbedCardProps) {
  const [showFallback, setShowFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<MoviePreview | null>(null)

  const handleShowFallback = async () => {
    setShowFallback(true)
    if (preview || isLoading) return

    setIsLoading(true)
    try {
      const result = await fetchMoviePreviewFromEiga(movieUrl)
      if (result.success) {
        setPreview({
          title: result.title ?? title,
          releaseDate: result.releaseDate ?? null,
          description: result.description ?? null,
          imageUrl: result.imageUrl ?? null,
          movieUrl: result.movieUrl ?? movieUrl,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden glass-card">
      <div className="px-3 py-2 border-b border-white/5 text-xs text-cinema-gold/70 font-medium">
        映画.com 作品情報
      </div>
      <iframe
        src={movieUrl}
        title={`${title} - 映画.com`}
        loading="lazy"
        className="w-full h-72"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        onError={handleShowFallback}
      />

      {!showFallback && (
        <div className="px-3 py-2 border-t border-white/5">
          <button
            type="button"
            onClick={handleShowFallback}
            className="text-xs text-slate-500 hover:text-cinema-gold-light transition-colors"
          >
            埋め込みが表示されない場合はメタ情報カードを表示
          </button>
        </div>
      )}

      {showFallback && (
        <div className="border-t border-white/5 p-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin text-cinema-gold" />
              作品情報を取得中...
            </div>
          ) : preview ? (
            <div className="space-y-3">
              {preview.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.imageUrl}
                  alt={preview.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-100">{preview.title}</p>
                {preview.releaseDate && (
                  <p className="text-xs text-slate-400">公開日: {preview.releaseDate}</p>
                )}
                {preview.description && (
                  <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed">{preview.description}</p>
                )}
              </div>
              <a
                href={preview.movieUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cinema-gold hover:text-cinema-gold-light transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                映画.comで詳細を見る
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">作品情報を取得できませんでした。</p>
              <a
                href={movieUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cinema-gold hover:text-cinema-gold-light transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                映画.comで詳細を見る
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
