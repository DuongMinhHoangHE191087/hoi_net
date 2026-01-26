// ============================================
// Date Formatting Utility (Alternative to date-fns)
// ============================================

/**
 * Format relative time in Vietnamese
 * Alternative to formatDistanceToNow from date-fns
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) {
    return 'vừa xong'
  } else if (diffMin < 60) {
    return `${diffMin} phút trước`
  } else if (diffHour < 24) {
    return `${diffHour} giờ trước`
  } else if (diffDay < 7) {
    return `${diffDay} ngày trước`
  } else if (diffWeek < 4) {
    return `${diffWeek} tuần trước`
  } else if (diffMonth < 12) {
    return `${diffMonth} tháng trước`
  } else {
    return `${diffYear} năm trước`
  }
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')

  return `${day}/${month}/${year} ${hour}:${minute}`
}

/**
 * Format date to "3 tháng 1, 2026"
 */
export function formatDateLong(date: string | Date): string {
  const d = new Date(date)
  const months = [
    'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
    'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
  ]

  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`
}

