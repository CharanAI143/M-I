// Shared helpers for timed practice sessions (Interview + SQL modules).
// Extracted verbatim from the duplicated definitions that lived in each module,
// so behavior is identical.

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-green-500 border-green-500/40 bg-green-500/10',
  Medium: 'text-yellow-500 border-yellow-500/40 bg-yellow-500/10',
  Hard: 'text-red-500 border-red-500/40 bg-red-500/10',
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}