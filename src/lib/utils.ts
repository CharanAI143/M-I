import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Parse a 'YYYY-MM-DD' string (or other date string) as a local-time Date.
// Plain YYYY-MM-DD strings are treated as UTC by the Date constructor, which
// shifts heatmap cells and streak calculations by one day in timezones west of
// UTC.  This helper constructs the date explicitly in the local timezone.
export function parseDateKey(value: Date | string | null | undefined): Date {
  if (value instanceof Date) return value
  const str = (value ?? '').trim()
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  return new Date(str)
}

export function formatDate(date: Date | string): string {
  const d = parseDateKey(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function getToday(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function daysSinceEpoch(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month, day) / (24 * 60 * 60 * 1000))
}

export function calculateStreak(
  activities: Array<{ date: string; problems_solved?: number; platform?: string }>,
  platform?: string
): number {
  if (!activities.length) return 0

  const today = new Date()
  const todayEpoch = daysSinceEpoch(today.getFullYear(), today.getMonth(), today.getDate())

  // Collect the set of distinct days that have activity with 3+ problems solved.
  const days = new Set<number>()
  for (const activity of activities) {
    if (platform && activity.platform !== platform) continue
    if ((activity.problems_solved ?? 0) < 3) continue
    const d = parseDateKey(activity.date)
    if (Number.isNaN(d.getTime())) continue
    days.add(daysSinceEpoch(d.getFullYear(), d.getMonth(), d.getDate()))
  }

  // Count consecutive days ending at today. Before the day's first solve the
  // streak is still "in progress": if yesterday had activity it carries
  // forward, and only resets once a full day goes by without activity.
  let cursor = todayEpoch
  if (!days.has(cursor)) {
    if (!days.has(cursor - 1)) return 0
    cursor -= 1
  }

  let streak = 0
  while (days.has(cursor)) {
    streak++
    cursor--
  }

  return streak
}
