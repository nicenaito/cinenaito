'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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

const previewCache = new Map<string, MoviePreview | null>()

export function EigaEmbedCard({ movieUrl, title }: EigaEmbedCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<MoviePreview | null>(null)
  const [hasTried, setHasTried] = useState(false)

  const loadPreview = useCallback(async () => {
    if (isLoading) return
    if (previewCache.has(movieUrl)) {
      const cached = previewCache.get(movieUrl) ?? null
      setPreview(cached)
      setHasTried(true)
      return
    }

    setIsLoading(true)
    try {
      const result = await fetchMoviePreviewFromEiga(movieUrl)
      if (result.success) {
        const previewData = {
          title: result.title ?? title,
          releaseDate: result.releaseDate ?? null,
          description: result.description ?? null,
          imageUrl: result.imageUrl ?? null,
          movieUrl: result.movieUrl ?? movieUrl,
        }
        previewCache.set(movieUrl, previewData)
        setPreview(previewData)
      } else {
        previewCache.set(movieUrl, null)
      }
    } finally {
      setHasTried(true)
      setIsLoading(false)
    }
  }, [isLoading, movieUrl, title])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadPreview()
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [loadPreview])

  return (
    <div ref={containerRef} className="rounded-lg border border-white/10 overflow-hidden glass-card">
      <div className="px-3 py-2 border-b border-white/5 text-xs text-cinema-gold/70 font-medium">
        映画.com 作品情報
      </div>
      <div className="p-3">
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
                className="w-full h-44 object-cover rounded-lg"
                loading="lazy"
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
            <p className="text-xs text-slate-400">
              {hasTried ? '作品情報を取得できませんでした。' : '作品情報を表示します。'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadPreview}
                className="text-xs text-slate-400 hover:text-cinema-gold-light transition-colors"
              >
                再取得
              </button>
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
          </div>
        )}
      </div>
    </div>
  )
}
