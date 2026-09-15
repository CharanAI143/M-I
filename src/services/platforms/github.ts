// GitHub sync: profile stats (followers, repos, top languages/repos) and the
// public Events API backfill that counts pushes over the last 30 days.

import type { Profile } from '@/lib/types'

import { fetchWithRetry, getTimeWindow, toDateKey, type TimeWindow } from '../http'

const GITHUB_HEADERS = {
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

function normalizeHandle(username: string): string {
  return username.trim().replace(/^@/, '').replace(/\/+$/, '')
}

export async function syncGitHub(username: string): Promise<Partial<Profile>> {
  const handle = normalizeHandle(username)
  try {
    const userRes = await fetchWithRetry(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
      headers: GITHUB_HEADERS,
    })
    if (!userRes.ok) throw new Error(`HTTP ${userRes.status}`)
    const user = await userRes.json()
    if (!user?.login) throw new Error('User not found')

    const topLanguages: Array<{ language: string; count: number }> = []
    const topRepos: Array<{ name: string; language: string | null; stars: number; html_url: string; fork: boolean }> = []
    let stars = 0
    let repoCount = 0
    try {
      const repoRes = await fetchWithRetry(
        `https://api.github.com/users/${encodeURIComponent(handle)}/repos?per_page=100&type=public&sort=updated`,
        { headers: GITHUB_HEADERS }
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

// GitHub's public Events API returns only the last ~90 events, but it's
// unauthenticated and free — enough to backfill the heatmap with pushes.
export async function fetchGithubPushActivity(
  username: string,
  today: string,
  window: TimeWindow = getTimeWindow()
): Promise<Array<{ date: string; count: number }>> {
  const handle = normalizeHandle(username)
  if (!handle) return []

  const res = await fetchWithRetry(
    `https://api.github.com/users/${encodeURIComponent(handle)}/events?per_page=100`,
    { headers: GITHUB_HEADERS }
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const events = await res.json()
  if (!Array.isArray(events)) return []

  const byDate: Record<string, number> = {}
  for (const ev of events) {
    if (ev.type !== 'PushEvent' || !ev.created_at) continue
    const ts = Math.floor(new Date(ev.created_at as string).getTime() / 1000)
    if (!Number.isFinite(ts) || ts < window.thirtyDaysAgoSec || ts > window.todayStartSec) continue
    const key = toDateKey(ts)
    const commits = Array.isArray(ev.payload?.commits) ? ev.payload.commits.length : 0
    byDate[key] = (byDate[key] || 0) + (commits || 1)
  }

  return Object.entries(byDate).map(([date, count]) => ({ date, count }))
}