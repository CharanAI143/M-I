// LeetCode sync: profile stats (accepted submissions by difficulty) and the
// recent accepted submissions used for the 30-day activity backfill.

import type { Profile } from '@/lib/types'

import { fetchWithRetry, getTimeWindow, toDateKey, type TimeWindow } from '../http'

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql'

interface RecentSubmission {
  titleSlug: string
  timestamp: string
}

async function graphql(query: string, variables: Record<string, unknown>): Promise<any> {
  const response = await fetchWithRetry(LEETCODE_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  return response.json()
}

export async function syncLeetCode(username: string): Promise<Partial<Profile>> {
  try {
    const data = await graphql(
      `query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          profile {
            ranking
            reputation
          }
        }
      }`,
      { username }
    )

    const user = data?.data?.matchedUser
    if (!user) throw new Error('User not found')

    const stats = user.submitStatsGlobal?.acSubmissionNum || []
    const getByDiff = (d: string) => stats.find((s: any) => s.difficulty === d)?.count || 0

    return {
      platform: 'leetcode',
      username,
      total_solved: getByDiff('All'),
      easy_solved: getByDiff('Easy'),
      medium_solved: getByDiff('Medium'),
      hard_solved: getByDiff('Hard'),
      rank: String(user.profile?.ranking || 'N/A'),
      rating: user.profile?.reputation || 0,
      last_synced: new Date().toISOString(),
    }
  } catch (error) {
    console.error('LeetCode sync failed:', error)
    return { platform: 'leetcode', username, last_synced: new Date().toISOString() }
  }
}

// Recent accepted submissions grouped by local date, filtered to the last 30
// days and to days on or before `today`.
export async function fetchLeetCodeSubmissions(
  username: string,
  today: string,
  window: TimeWindow = getTimeWindow()
): Promise<Array<{ date: string; count: number }>> {
  const data = await graphql(
    `query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        titleSlug
        timestamp
      }
    }`,
    { username, limit: 500 }
  )

  const list: RecentSubmission[] = data?.data?.recentAcSubmissionList || []
  const byDate: Record<string, number> = {}
  for (const s of list) {
    const ts = Number(s.timestamp)
    if (ts >= window.thirtyDaysAgoSec) {
      const key = toDateKey(ts)
      if (key <= today) {
        byDate[key] = (byDate[key] || 0) + 1
      }
    }
  }
  return Object.entries(byDate).map(([date, count]) => ({ date, count }))
}