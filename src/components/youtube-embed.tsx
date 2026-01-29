'use client'

import { extractYouTubeVideoId } from '@/lib/helpers'

interface YouTubeEmbedProps {
  url: string
  title?: string
}

export function YouTubeEmbed({ url, title = '予告編' }: YouTubeEmbedProps) {
  const videoId = extractYouTubeVideoId(url)

  if (!videoId) {
    return (
      <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
        <p>動画を読み込めません</p>
      </div>
    )
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden">
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
