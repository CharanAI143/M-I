// Shared HTTP utilities for the sync services: a small retry wrapper and the
// date math used by the 30-day activity backfills.

// Fetch with bounded retries for transient failures (rate limits, 5xx, network
// blips). 4xx responses (except those in `retryStatuses`) are returned as-is so
// callers can surface meaningful errors instead of waiting out retries.
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retries = 2
): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init)
      if (res.ok) return res
      if (!RETRYABLE_STATUSES.has(res.status)) return res
      lastError = new Error(`HTTP ${res.status}`)
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
    if (attempt < retries) {
      const backoffMs = 250 * (attempt + 1)
      await new Promise((r) => setTimeout(r, backoffMs))
    }
  }
  throw lastError
}

export interface TimeWindow {
  todayStartSec: number
  thirtyDaysAgoSec: number
}

// Start-of-today and start-of-30-days-ago in epoch seconds, recomputed per call
// so the window is always relative to "now". "Today" is the app's fixed UTC
// day (see getToday in @/lib/utils), never the machine's local timezone.
export function getTimeWindow(): TimeWindow {
  const now = new Date()
  const todayStartUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const todayStartSec = Math.floor(todayStartUtc / 1000)
  return { todayStartSec, thirtyDaysAgoSec: todayStartSec - 30 * 24 * 60 * 60 }
}

// Formats an epoch-seconds timestamp as a UTC YYYY-MM-DD date key, matching the
// application's canonical date convention (UTC; see getToday in @/lib/utils).
export function toDateKey(tsSec: number): string {
  const d = new Date(tsSec * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}