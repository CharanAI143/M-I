// GeeksforGeeks profile stats via an unofficial stats card API, fetched through
// the main process to bypass renderer CORS.

import type { Profile } from '@/lib/types'

import { fetchWithRetry } from '../http'

// Accept either a plain username or a full profile URL like
// https://www.geeksforgeeks.org/user/<handle>/ and extract the handle.
function normalizeGfgHandle(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, '')
  const urlMatch = trimmed.match(/geeksforgeeks\.org\/user\/([^/?#]+)/i)
  return urlMatch ? decodeURIComponent(urlMatch[1]) : trimmed
}

// Fetch a stats endpoint from the main process to bypass renderer CORS.
async function fetchStatsText(url: string): Promise<string> {
  const ipc = (window as any).electron?.ipcRenderer
  if (ipc && typeof ipc.invoke === 'function') {
    return (await ipc.invoke('stats:fetch-text', url)) as string
  }
  const response = await fetchWithRetry(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return await response.text()
}

function gfgNum(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export async function syncGFG(input: string): Promise<Partial<Profile>> {
  const username = normalizeGfgHandle(input)
  try {
    // The unofficial GeeksforGeeks stats API. `geeks-for-geeks-api.vercel.app`
    // is broken (returns "Could not find user data" for everyone), so we use
    // gfgstatscard.vercel.app which reliably returns per-difficulty counts.
    const text = await fetchStatsText(
      `https://gfgstatscard.vercel.app/${encodeURIComponent(username)}?raw=true`
    )
    const data = JSON.parse(text || '{}') as Record<string, unknown>
    if (!data || typeof data !== 'object' || !data.userHandle) {
      throw new Error('Invalid GFG profile data')
    }

    const school = gfgNum(data.School)
    const basic = gfgNum(data.Basic)
    const easy = gfgNum(data.Easy)
    const medium = gfgNum(data.Medium)
    const hard = gfgNum(data.Hard)

    return {
      platform: 'geeksforgeeks',
      username,
      total_solved: school + basic + easy + medium + hard,
      easy_solved: easy,
      medium_solved: medium,
      hard_solved: hard,
      rank: data.institute_rank != null && data.institute_rank !== '' ? String(data.institute_rank) : 'N/A',
      rating: gfgNum(data.total_score),
      last_synced: new Date().toISOString(),
    }
  } catch (error) {
    console.error('GFG sync failed:', error)
    // On failure do NOT reset the stored stats — only refresh the timestamp.
    return { platform: 'geeksforgeeks', username, last_synced: new Date().toISOString() }
  }
}