// CodeChef profile stats via the unofficial stats API.

import type { Profile } from '@/lib/types'

import { fetchWithRetry } from '../http'

export async function syncCodeChef(username: string): Promise<Partial<Profile>> {
  try {
    const response = await fetchWithRetry(`https://codechef-stats.tashif.codes/${username}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    const user = data?.data || {}
    const byDifficulty: Record<string, number> = user?.byDifficulty || {}
    return {
      platform: 'codechef',
      username,
      total_solved: Number(user.totalSolved || 0),
      easy_solved: Number(byDifficulty.easy || 0),
      medium_solved: Number(byDifficulty.medium || 0),
      hard_solved: Number(byDifficulty.hard || 0),
      rank: user.rank || 'N/A',
      rating: Number(user.currentRating || 0),
      last_synced: new Date().toISOString(),
    }
  } catch (error) {
    console.error('CodeChef sync failed:', error)
    return { platform: 'codechef', username, last_synced: new Date().toISOString() }
  }
}