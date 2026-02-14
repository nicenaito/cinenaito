/**
 * YouTube URLから動画IDを抽出
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null
  
  const patterns = [
    // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // https://youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // https://www.youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // https://www.youtube.com/v/VIDEO_ID
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * 月の表示形式を取得 (例: "2026年1月")
 */
export function formatMonth(targetMonth: string): string {
  const [year, month] = targetMonth.split('-')
  return `${year}年${parseInt(month)}月`
}

/**
 * 現在の月をYYYY-MM形式で取得
 */
export function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function isValidYearMonth(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value)
}

/**
 * 月のリストを生成（前後6ヶ月）
 */
export function generateMonthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = []
  const now = new Date()
  
  for (let i = -3; i <= 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = `${date.getFullYear()}年${date.getMonth() + 1}月`
    months.push({ value, label })
  }
  
  return months
}

/**
 * 相対時間を表示
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'たった今'
  if (diffMins < 60) return `${diffMins}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function extractYearMonthFromReleaseDate(releaseDate: string | null): string | null {
  if (!releaseDate) return null

  const isoMatch = releaseDate.match(/^(\d{4})-(\d{2})-\d{2}$/)
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}`
  }

  const isoMonthOnly = releaseDate.match(/^(\d{4})-(\d{2})$/)
  if (isoMonthOnly) {
    return `${isoMonthOnly[1]}-${isoMonthOnly[2]}`
  }

  const slashDate = releaseDate.match(/^(\d{4})\/(\d{1,2})(?:\/\d{1,2})?$/)
  if (slashDate) {
    return `${slashDate[1]}-${slashDate[2].padStart(2, '0')}`
  }

  const jpMatch = releaseDate.match(/(\d{4})年\s*(\d{1,2})月\s*\d{1,2}日/)
  if (jpMatch) {
    const month = jpMatch[2].padStart(2, '0')
    return `${jpMatch[1]}-${month}`
  }

  const jpMonthOnly = releaseDate.match(/(\d{4})年\s*(\d{1,2})月/)
  if (jpMonthOnly) {
    const month = jpMonthOnly[2].padStart(2, '0')
    return `${jpMonthOnly[1]}-${month}`
  }

  return null
}
