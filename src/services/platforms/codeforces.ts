// Codeforces sync: profile stats via user.info + solved-stats pagination, and
// accepted-submission timestamps for the 30-day activity backfill.

import type { Profile } from '@/lib/types'
import { CODEFORCES_API, fetchCodeforcesSolved } from '@/lib/codeforces'

import { fetchWithRetry, getTimeWindow, toDateKey, type TimeWindow } from '../http'

export async function syncCodeforces(username: string): Promise<Partial<Profile>> {
  try {
    const infoResponse = await fetchWithRetry(`${CODEFORCES_API}/user.info?handles=${username}`)
    const info = await infoResponse.json()
    if (info.status !== 'OK') throw new Error('User not found')

    const user = info.result[0]
    const solved = await fetchCodeforcesSolved(username)

    return {
      platform: 'codeforces',
      username,
      total_solved: solved.total,
      easy_solved: solved.easy,
      medium_solved: solved.medium,
      hard_solved: solved.hard,
      rank: user.rank || 'N/A',
      rating: user.rating || 0,
      last_synced: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Codeforces sync failed:', error)
    return { platform: 'codeforces', username, last_synced: new Date().toISOString() }
  }
}

// Accepted submissions (verdict OK) grouped by local date, filtered to the last
// 30 days and to days on or before `today`.
export async function fetchCodeforcesSubmissions(
  username: string,
  today: string,
  window: TimeWindow = getTimeWindow()
): Promise<Array<{ date: string; count: number }>> {
  const response = await fetchWithRetry(`${CODEFORCES_API}/user.status?handle=${username}&from=1&count=1000`)
  const data = await response.json()

  const byDate: Record<string, number> = {}
  if (data.status === 'OK') {
    for (const sub of data.result) {
      if (sub.verdict === 'OK' && sub.problem) {
        const ts = Number(sub.creationTimeSeconds)
        if (ts >= window.thirtyDaysAgoSec) {
          const key = toDateKey(ts)
          if (key <= today) {
            byDate[key] = (byDate[key] || 0) + 1
          }
        }
      }
    }
  }
  return Object.entries(byDate).map(([date, count]) => ({ date, count }))
}