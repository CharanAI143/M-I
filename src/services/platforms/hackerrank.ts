// HackerRank profile stats via the unofficial stats API.

import type { Profile } from '@/lib/types'

import { fetchWithRetry } from '../http'

export async function syncHackerRank(username: string): Promise<Partial<Profile>> {
  try {
    const response = await fetchWithRetry(`https://hackerrank-stats.tashif.codes/${username}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return {
      platform: 'hackerrank',
      username,
      total_solved: Number(data?.totalSolved || 0),
      rank: data?.ranking != null ? String(data.ranking) : 'N/A',
      rating: Number(data?.practiceScore || 0),
      last_synced: new Date().toISOString(),
    }
  } catch (error) {
    console.error('HackerRank sync failed:', error)
    return { platform: 'hackerrank', username, last_synced: new Date().toISOString() }
  }
}