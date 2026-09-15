import type { Platform, Profile } from '@/lib/types'
import { dbApi } from '@/store'
import { CODEFORCES_API, fetchCodeforcesSolved } from '@/lib/codeforces'
import { getToday } from '@/lib/utils'
import { secureGenerateAI } from '@/lib/secure'

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql'

// Sync recent submissions from platforms and log as daily activities
export async function syncPlatformActivity(username: string, platform: Platform): Promise<void> {
  const today = getToday()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayStartSec = Math.floor(todayStart.getTime() / 1000)
  const thirtyDaysAgoSec = todayStartSec - 30 * 24 * 60 * 60

  try {
    let submissions: Array<{ date: string; count: number }> = []

    if (platform === 'codeforces') {
      const response = await fetch(`${CODEFORCES_API}/user.status?handle=${username}&from=1&count=1000`)
      const data = await response.json()
      if (data.status === 'OK') {
        const byDate: Record<string, number> = {}
        for (const sub of data.result) {
          if (sub.verdict === 'OK' && sub.problem) {
            const ts = Number(sub.creationTimeSeconds)
            if (ts >= thirtyDaysAgoSec) {
              const date = new Date(ts * 1000)
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
              if (key <= today) {
                byDate[key] = (byDate[key] || 0) + 1
              }
            }
          }
        }
        submissions = Object.entries(byDate).map(([date, count]) => ({ date, count }))
      }
    } else if (platform === 'leetcode') {
      const response = await fetch(LEETCODE_GRAPHQL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query recentAcSubmissions($username: String!, $limit: Int!) {
            recentAcSubmissionList(username: $username, limit: $limit) {
              titleSlug
              timestamp
            }
          }`,
          variables: { username, limit: 500 },
        }),
      })
      const data = await response.json()
      const list = data?.data?.recentAcSubmissionList || []
      const byDate: Record<string, number> = {}
      for (const s of list) {
        const ts = Number(s.timestamp)
        if (ts >= thirtyDaysAgoSec) {
          const date = new Date(ts * 1000)
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          if (key <= today) {
            byDate[key] = (byDate[key] || 0) + 1
          }
        }
      }
      submissions = Object.entries(byDate).map(([date, count]) => ({ date, count }))
    }
    // CodeChef, HackerRank, GFG don't have public recent submission APIs with timestamps

    // Log each day's activity (upsert by platform+date)
    for (const { date, count } of submissions) {
      const existing = await dbApi.loadActivities().then(acts =>
        acts.find(a => a.platform === platform && a.date === date)
      )
      if (!existing || (existing.problems_solved || 0) < count) {
        await dbApi.logActivity(platform, count, 0, 0, 0, date, { ignoreClockGuard: true })
      }
    }
  } catch (error) {
    console.error(`${platform} activity sync failed:`, error)
  }
}

export async function syncAllPlatformActivities(profiles: Array<{ platform: Platform; username: string }>): Promise<void> {
  for (const profile of profiles) {
    if (!profile.username) continue
    if (['codeforces', 'leetcode'].includes(profile.platform)) {
      await syncPlatformActivity(profile.username, profile.platform)
    } else if (profile.platform === 'github') {
      await syncGithubActivity(profile.username)
    }
  }
}

// GitHub's public Events API returns only the last ~90 events, but it's
// unauthenticated and free — enough to backfill the heatmap with pushes.
export async function syncGithubActivity(username: string): Promise<void> {
  const handle = username.trim().replace(/^@/, '').replace(/\/+$/, '')
  if (!handle) return
  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(handle)}/events?per_page=100`,
      { headers: { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const events = await res.json()
    if (!Array.isArray(events)) return

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayStartSec = Math.floor(todayStart.getTime() / 1000)
    const thirtyDaysAgoSec = todayStartSec - 30 * 24 * 60 * 60

    const byDate: Record<string, number> = {}
    for (const ev of events) {
      if (ev.type !== 'PushEvent' || !ev.created_at) continue
      const ts = Math.floor(new Date(ev.created_at as string).getTime() / 1000)
      if (!Number.isFinite(ts) || ts < thirtyDaysAgoSec || ts > todayStartSec) continue
      const date = new Date(ts * 1000)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const commits = Array.isArray(ev.payload?.commits) ? ev.payload.commits.length : 0
      byDate[key] = (byDate[key] || 0) + (commits || 1)
    }

    for (const [date, count] of Object.entries(byDate)) {
      const existing = (await dbApi.loadActivities()).find(
        (a) => a.platform === 'github' && a.date === date
      )
      if (!existing || (existing.problems_solved || 0) < count) {
        await dbApi.logActivity('github', count, 0, 0, 0, date, { ignoreClockGuard: true })
      }
    }
  } catch (error) {
    console.error('GitHub activity sync failed:', error)
  }
}

export async function syncDetailedActivity(username: string, platform: Platform): Promise<void> {
  if (platform === 'github') {
    await syncGithubActivity(username)
  } else if (['codeforces', 'leetcode'].includes(platform)) {
    await syncPlatformActivity(username, platform)
  }
}

export async function syncLeetCode(username: string): Promise<Partial<Profile>> {
  try {
    const response = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
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
          }
        `,
        variables: { username },
      }),
    })

    const data = await response.json()
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

export async function syncCodeforces(username: string): Promise<Partial<Profile>> {
  try {
    const infoResponse = await fetch(`${CODEFORCES_API}/user.info?handles=${username}`)
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

export async function syncCodeChef(username: string): Promise<Partial<Profile>> {
  try {
    const response = await fetch(`https://codechef-stats.tashif.codes/${username}`)
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

export async function syncHackerRank(username: string): Promise<Partial<Profile>> {
  try {
    const response = await fetch(`https://hackerrank-stats.tashif.codes/${username}`)
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
  const response = await fetch(url)
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

export async function syncGitHub(username: string): Promise<Partial<Profile>> {
  const handle = username.trim().replace(/^@/, '').replace(/\/+$/, '')
  try {
    const headers = { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, { headers })
    if (!userRes.ok) throw new Error(`HTTP ${userRes.status}`)
    const user = await userRes.json()
    if (!user?.login) throw new Error('User not found')

    const topLanguages: Array<{ language: string; count: number }> = []
    const topRepos: Array<{ name: string; language: string | null; stars: number; html_url: string; fork: boolean }> = []
    let stars = 0
    let repoCount = 0
    try {
      const repoRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(handle)}/repos?per_page=100&type=public&sort=updated`,
        { headers }
      )
      if (repoRes.ok) {
        const list = await repoRes.json()
        if (Array.isArray(list)) {
          repoCount = list.filter((r: any) => !r.fork).length
          const langCounts = new Map<string, number>()
          for (const r of list) {
            stars += r.stargazers_count || 0
            if (r.language) langCounts.set(r.language, (langCounts.get(r.language) || 0) + 1)
          }
          topLanguages.push(
            ...[...langCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([language, count]) => ({ language, count }))
          )
          topRepos.push(
            ...list
              .slice()
              .sort((a: any, b: any) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
              .slice(0, 5)
              .map((r: any) => ({
                name: r.name,
                language: r.language || null,
                stars: r.stargazers_count || 0,
                html_url: r.html_url,
                fork: !!r.fork,
              }))
          )
        }
      }
    } catch {
      // repo fetch is best-effort; profile data is still usable
    }

    return {
      platform: 'github',
      username: handle,
      total_solved: 0,
      easy_solved: 0,
      medium_solved: 0,
      hard_solved: 0,
      rank: 'GitHub',
      stars,
      followers: user.followers || 0,
      following: user.following || 0,
      public_repos: user.public_repos || repoCount || 0,
      avatar_url: user.avatar_url || '',
      name: user.name || user.login || '',
      bio: user.bio || '',
      location: user.location || '',
      blog: user.blog || '',
      top_languages: JSON.stringify(topLanguages),
      top_repos: JSON.stringify(topRepos),
      last_synced: new Date().toISOString(),
    }
  } catch (error) {
    console.error('GitHub sync failed:', error)
    return { platform: 'github', username: handle, last_synced: new Date().toISOString() }
  }
}

export const SYNC_FUNCTIONS: Record<Platform, (username: string) => Promise<Partial<Profile>>> = {
  leetcode: syncLeetCode,
  codeforces: syncCodeforces,
  codechef: syncCodeChef,
  hackerrank: syncHackerRank,
  geeksforgeeks: syncGFG,
  github: syncGitHub,
}

export async function syncAllPlatforms(profiles: Array<{ platform: Platform; username: string }>): Promise<void> {
  for (const profile of profiles) {
    if (!profile.username) continue
    const syncFn = SYNC_FUNCTIONS[profile.platform]
    if (syncFn) {
      // Get previous total before sync
      const existingProfiles = await dbApi.loadProfiles()
      const existing = existingProfiles.find(p => p.platform === profile.platform)
      const prevTotal = existing?.total_solved ?? 0

      const data = await syncFn(profile.username)
      await dbApi.updateProfile(profile.platform, data)

      // Detect delta and log as today's activity
      const newTotal = data.total_solved ?? 0
      const delta = newTotal - prevTotal
      if (delta > 0) {
        const today = getToday()
        const existingActivity = (await dbApi.loadActivities()).find(
          a => a.platform === profile.platform && a.date === today
        )
        if (!existingActivity || (existingActivity.problems_solved ?? 0) < delta) {
          await dbApi.logActivity(profile.platform, delta, 0, 0, 0, today)
        }
      }
    }
  }
}

export async function generateRoadmap(
  courseName: string,
  courseUrl: string,
  apiKey: string,
  provider: string,
  model: string,
  customEndpoint?: string
): Promise<string> {
  const outputSchema = {
    isCoding: 'boolean',
    title: 'string',
    description: 'string',
    topics: [
      {
        name: 'string',
        description: 'string',
        estimatedHours: 'number',
        notes: ['string'],
        problems: [{ name: 'string', difficulty: '"Easy"|"Medium"|"Hard"', platform: '"LeetCode"|"Codeforces"|"GFG"', url: 'string' }],
        resources: [{ title: 'string', url: 'string' }],
      },
    ],
    milestones: [{ title: 'string', description: 'string', week: 'number' }],
  }

  const systemPrompt = `You are an expert course analyzer. Given a course name or URL, determine if it is coding-related or a general course.

If it is a CODING course, produce a practical topic-by-topic breakdown with specific, real, curated practice problems (Easy, Medium, Hard) drawn from LeetCode, Codeforces, and GeeksforGeeks, one per row, each with a working problem URL.

If it is a GENERAL course, produce an optimal study framework with key concepts, relevant resource links, and actionable learning milestones.

CRITICAL OUTPUT RULES:
- Respond with ONLY one valid JSON object. Do NOT wrap it in markdown fences, do NOT add prose or code blocks around it, and do NOT include trailing commas.
- Every field in the schema below must be present.
- "notes" must contain 3-5 bullet-point notes per topic written in simple, beginner-friendly language that explain the core ideas, key concepts, common pitfalls, and how to approach, understand, and study the topic.
- "problems" must contain at least 3 problems per topic, and every problem must include a real "url".
- "resources" MUST contain only YouTube video URLs (https://www.youtube.com/... or https://youtu.be/...) — NO website links, NO blog links, NO documentation links. Each resource must be a direct link to a well-explained YouTube video covering the topic.
- "milestones" must contain 3-6 entries with increasing "week" values.

Return exactly this shape:
${JSON.stringify(outputSchema, null, 2)}`

  const userPrompt = `Analyze this course and create a comprehensive roadmap: ${courseName}${courseUrl ? ` (${courseUrl})` : ''}`

  // Route through the main process so the API key never appears in renderer code.
  return secureGenerateAI({
    provider,
    apiKey,
    model,
    systemPrompt,
    userPrompt,
    customEndpoint,
    temperature: 0.7,
    maxTokens: 8192,
  })
}

// Validate YouTube URLs via main-process fetch (bypasses CORS).
// Returns a map of url -> boolean availability.
export async function validateYoutubeUrls(urls: string[]): Promise<Map<string, boolean>> {
  const ipc = (window as any).electron?.ipcRenderer
  const result = new Map<string, boolean>()
  if (!ipc || typeof ipc.invoke !== 'function') {
    // Browser fallback — can't verify due to CORS, assume available
    urls.forEach((u) => result.set(u, true))
    return result
  }
  // Check in parallel but with slight delay to avoid rate limiting
  await Promise.all(
    urls.map(async (url, i) => {
      await new Promise((r) => setTimeout(r, i * 150))
      try {
        const res = await ipc.invoke('yt:check', url)
        result.set(url, res?.available === true)
      } catch {
        result.set(url, false)
      }
    })
  )
  return result
}
