'use client'

import { extractYouTubeVideoId } from '@/lib/helpers'
import { Film } from 'lucide-react'

interface YouTubeEmbedProps {
  url: string
  title?: string
}

export function YouTubeEmbed({ url, title = '予告編' }: YouTubeEmbedProps) {
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

  return (
    <div className="aspect-video rounded-lg overflow-hidden ring-1 ring-white/10">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
