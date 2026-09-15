export interface Contest {
  platform: 'codechef' | 'leetcode' | 'codeforces'
  title: string
  url: string
  startTime: number
  duration: number
}

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql'
const CODECHEF_API =
  'https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&limit=40'

async function getJSON(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function fetchLeetCodeContests(): Promise<Contest[]> {
  const data = await getJSON(LEETCODE_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query upcomingContests {
        upcomingContests {
          title
          titleSlug
          startTime
          duration
        }
      }`,
    }),
  })

  const list: any[] = data?.data?.upcomingContests || []
  return list.map((c) => ({
    platform: 'leetcode' as const,
    title: c.title,
    url: `https://leetcode.com/contest/${c.titleSlug}`,
    startTime: Number(c.startTime) * 1000,
    duration: Number(c.duration) * 1000,
  }))
}

export async function fetchCodeChefContests(): Promise<Contest[]> {
  const data = await getJSON(CODECHEF_API)
  const list: any[] = data?.future_contests || []

  const mapped: (Contest | null)[] = list.map((c) => {
    const start = Date.parse(c.contest_start_date_iso || '')
    if (Number.isNaN(start)) return null
    return {
      platform: 'codechef',
      title: c.contest_name || c.contest_code,
      url: `https://www.codechef.com/${c.contest_code}`,
      startTime: start,
      duration: Number(c.contest_duration || 0) * 60 * 1000,
    }
  })

  return mapped.filter((c): c is Contest => c !== null)
}

export async function fetchCodeForcesContests(): Promise<Contest[]> {
  const data = await getJSON('https://codeforces.com/api/contest.list')
  const list: any[] = data?.result || []

  const mapped: (Contest | null)[] = list
    .filter((c) => c.phase === 'BEFORE' || c.phase === 'CODING')
    .map((c) => {
      if (!c.id) return null
      return {
        platform: 'codeforces' as const,
        title: c.name,
        url: `https://codeforces.com/contests/${c.id}`,
        startTime: Number(c.startTimeSeconds) * 1000,
        duration: Number(c.durationSeconds) * 1000,
      }
    })

  return mapped.filter((c): c is Contest => c !== null)
}