'use client'

import { useState } from 'react'
import { extractYouTubeVideoId } from '@/lib/helpers'
import { Film, PlayCircle } from 'lucide-react'

interface YouTubeEmbedProps {
  url: string
  title?: string
}

export function YouTubeEmbed({ url, title = '予告編' }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const videoId = extractYouTubeVideoId(url)

  if (!videoId) {
    return (
      <div className="aspect-video glass-card rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Film className="w-8 h-8 text-cinema-gold/30 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">動画を読み込めません</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <button
        type="button"
        onClick={() => setIsLoaded(true)}
        className="relative block w-full aspect-video rounded-lg overflow-hidden ring-1 ring-white/10 group"
        aria-label="YouTube動画を再生"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <PlayCircle className="w-14 h-14 text-white/90 drop-shadow" />
        </div>
      </button>
    )
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden ring-1 ring-white/10">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
