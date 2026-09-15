import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { dbApi } from '@/lib/db'
import { PLATFORMS } from '@/lib/types'
import type { Platform, Ladder } from '@/lib/types'
import { cfSolveKey } from '@/lib/codeforces'
import { fetchCodeforcesSolved } from '@/lib/codeforces'
import { SYNC_FUNCTIONS } from '@/services/platforms'
import { syncDetailedActivity } from '@/services/sync-coordinator'
import { getToday } from '@/lib/utils'
import { LaddersDialog } from '@/components/ladders/LaddersDialog'
import { ProfileCard } from '@/components/profiles/ProfileCard'

export default function Profiles() {
  const { profiles, setProfiles } = useAppStore()
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [laddersOpen, setLaddersOpen] = useState(false)
  const cfHandle = profiles.find((pr) => pr.platform === 'codeforces')?.username ?? ''
  const [, setLadders] = useState<(Ladder & { solvedCount: number })[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const initial: Record<string, string> = {}
    for (const p of PLATFORMS) {
      const existing = profiles.find((pr) => pr.platform === p.id)
      initial[p.id] = existing?.username ?? ''
    }
    setInputValues(initial)
  }, [profiles])

  const loadLadders = useCallback(async () => {
    if (!cfHandle) return
    try {
      const data = await dbApi.loadLadders(cfHandle)
      let solvedKeys = new Set<string>()
      try {
        const s = await fetchCodeforcesSolved(cfHandle)
        solvedKeys = s.keys
      } catch {}
      setLadders(data.map((l) => ({
        ...l,
        solvedCount: l.problems.filter((p) => solvedKeys.has(cfSolveKey(p.contestId, p.index))).length,
      })))
    } catch {}
  }, [cfHandle])

  useEffect(() => {
    loadLadders()
  }, [loadLadders])

  useEffect(() => {
    if (!laddersOpen) loadLadders()
  }, [laddersOpen, loadLadders])

  const handleUsernameChange = (platformId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [platformId]: value }))
  }

  const saveUsername = async (platformId: Platform) => {
    let username = inputValues[platformId]?.trim()
    if (!username) return
    if (platformId === 'github') {
      username = username.replace(/^@/, '').replace(/\/+$/, '')
    }

    // Get previous total before sync
    const existingProfiles = await dbApi.loadProfiles()
    const existing = existingProfiles.find(p => p.platform === platformId)
    const prevTotal = existing?.total_solved ?? 0

    await dbApi.updateProfile(platformId, { username })
    let updated = await dbApi.loadProfiles()
    setProfiles(updated)

    // Sync profile stats and detect delta
    const syncFn = SYNC_FUNCTIONS[platformId]
    if (syncFn) {
      try {
        const data = await syncFn(username)
        await dbApi.updateProfile(platformId, data)
        updated = await dbApi.loadProfiles()
        setProfiles(updated)

        // Detect delta and log as today's activity for ALL platforms
        const newTotal = data.total_solved ?? 0
        const delta = newTotal - prevTotal
        if (delta > 0) {
          const today = getToday()
          const activities = await dbApi.loadActivities()
          const existingActivity = activities.find(
            a => a.platform === platformId && a.date === today
          )
          if (!existingActivity || (existingActivity.problems_solved ?? 0) < delta) {
            await dbApi.logActivity(platformId, delta, 0, 0, 0, today)
            const refreshed = await dbApi.loadActivities()
            useAppStore.getState().setActivities(refreshed)
          }
        }
      } catch (error) {
        console.error(`Failed to sync ${platformId}:`, error)
      }
    }

    // Also sync detailed submission/commit activity for platforms that support it
    if (['codeforces', 'leetcode', 'github'].includes(platformId)) {
      try {
        await syncDetailedActivity(username, platformId)
        const activities = await dbApi.loadActivities()
        useAppStore.getState().setActivities(activities)
      } catch (error) {
        console.error(`Failed to sync ${platformId} activity:`, error)
      }
    }
  }

  const syncActivity = async (platformId: Platform) => {
    try {
      await syncDetailedActivity(inputValues[platformId], platformId)
      const activities = await dbApi.loadActivities()
      useAppStore.getState().setActivities(activities)
    } catch (error) {
      console.error(`Failed to sync ${platformId} activity:`, error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profiles</h2>
        <p className="text-muted-foreground mt-1">
          Connect and sync your competitive programming and GitHub accounts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORMS.map((platform) => {
          const data = profiles.find((p) => p.platform === platform.id)
          return (
            <ProfileCard
              key={platform.id}
              platform={platform}
              data={data}
              inputValue={inputValues[platform.id] ?? ''}
              githubExpanded={expanded === 'github'}
              onUsernameChange={(v) => handleUsernameChange(platform.id, v)}
              onSave={() => saveUsername(platform.id)}
              onToggleGithub={() => setExpanded(expanded === 'github' ? null : 'github')}
              onSyncActivity={() => syncActivity(platform.id)}
              onAddLadders={() => setLaddersOpen(true)}
            />
          )
        })}
      </div>

      <LaddersDialog open={laddersOpen} onOpenChange={setLaddersOpen} handle={cfHandle} />
    </div>
  )
}