// Sync coordinator: ties the platform services to the data layer. Profile-stats
// sync (syncAllPlatforms) compares solved totals before/after and logs the delta.
// Activity sync (syncPlatformActivity / syncGithubActivity / backfills) upserts
// per-day, per-platform activity rows so streaks and heatmaps stay fresh.

import { dbApi } from '@/lib/db'
import type { Platform } from '@/lib/types'
import { getToday } from '@/lib/utils'

import { SYNC_FUNCTIONS } from './platforms'
import { fetchCodeforcesSubmissions } from './platforms/codeforces'
import { fetchGithubPushActivity } from './platforms/github'
import { fetchLeetCodeSubmissions } from './platforms/leetcode'

// Upsert a single platform/day activity row, never downgrading an existing
// count. Past-date writes deliberately bypass the clock guard.
async function logActivityUpsert(platform: string, date: string, count: number): Promise<void> {
  const existing = await dbApi.loadActivities().then((acts) =>
    acts.find((a) => a.platform === platform && a.date === date)
  )
  if (!existing || (existing.problems_solved || 0) < count) {
    await dbApi.logActivity(platform, count, 0, 0, 0, date, { ignoreClockGuard: true })
  }
}

// Sync recent submissions from platforms and log as daily activities
export async function syncPlatformActivity(username: string, platform: Platform): Promise<void> {
  const today = getToday()
  try {
    let submissions: Array<{ date: string; count: number }> = []
    if (platform === 'codeforces') {
      submissions = await fetchCodeforcesSubmissions(username, today)
    } else if (platform === 'leetcode') {
      submissions = await fetchLeetCodeSubmissions(username, today)
    }
    // CodeChef, HackerRank, GFG don't have public recent submission APIs with timestamps

    // Log each day's activity (upsert by platform+date)
    for (const { date, count } of submissions) {
      await logActivityUpsert(platform, date, count)
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

export async function syncGithubActivity(username: string): Promise<void> {
  const today = getToday()
  try {
    const submissions = await fetchGithubPushActivity(username, today)
    for (const { date, count } of submissions) {
      await logActivityUpsert('github', date, count)
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

// Run every platform's profile-stats sync and log today's solve delta.
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