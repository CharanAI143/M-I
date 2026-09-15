import { Notification, net, app, shell } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { AlarmPlatform, AlarmConfig } from '../src/types/ipc'

export type { AlarmPlatform, AlarmConfig }

export interface Contest {
  platform: AlarmPlatform
  title: string
  url: string
  startTime: number
  duration: number
}

type TimerHandle = ReturnType<typeof setTimeout>

// setTimeout delays are stored as a 32-bit signed int; anything above this
// overflows and fires immediately (~24.8 days). Far-future contests are re-armed
// on a later refresh tick instead.
const MAX_TIMEOUT = 2 ** 31 - 1

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

async function fetchJSON(url: string, options?: Record<string, unknown>): Promise<any> {
  const response = await net.fetch(url, options)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

async function fetchLeetCodeContests(): Promise<Contest[]> {
  const data = await fetchJSON('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
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

async function fetchCodeChefContests(): Promise<Contest[]> {
  const data = await fetchJSON(
    'https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&limit=40',
    { headers: { 'User-Agent': UA, Accept: 'application/json' } }
  )
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

async function fetchCodeForcesContests(): Promise<Contest[]> {
  const data = await fetchJSON('https://codeforces.com/api/contest.list', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
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

const platformFetch: Record<AlarmPlatform, () => Promise<Contest[]>> = {
  codechef: fetchCodeChefContests,
  leetcode: fetchLeetCodeContests,
  codeforces: fetchCodeForcesContests,
}

function contestId(c: Contest): string {
  return `${c.platform}-${c.title}-${c.startTime}`
}

/**
 * Background contest alarm. Lives in the main process so notifications keep
 * firing when the window is hidden or closed (the app stays in the tray).
 * Re-fetches the contest list periodically so reminders stay fresh even when
 * the renderer is not running.
 */
class AlarmManager {
  private config: AlarmConfig = { enabled: false, remindMinutes: 15, platform: 'codechef' }
  private contests: Contest[] = []
  private timers: Map<string, TimerHandle> = new Map()
  private notified = new Set<string>()
  private refreshTimer: TimerHandle | null = null
  private refreshing = false
  private stateFile = ''

  init(): void {
    this.stateFile = join(app.getPath('userData'), 'alarm-state.json')
    try {
      if (existsSync(this.stateFile)) {
        const saved = JSON.parse(
          readFileSync(this.stateFile, 'utf-8')
        ) as Partial<AlarmConfig> & { notified?: string[] }
        this.config = {
          enabled: saved.enabled === true,
          remindMinutes:
            typeof saved.remindMinutes === 'number' && saved.remindMinutes > 0
              ? saved.remindMinutes
              : 15,
          platform:
            saved.platform === 'codechef' ||
            saved.platform === 'leetcode' ||
            saved.platform === 'codeforces'
              ? saved.platform
              : 'codechef',
        }
        if (Array.isArray(saved.notified)) {
          for (const id of saved.notified) this.notified.add(id)
        }
      }
      if (this.config.enabled) {
        this.configure({ ...this.config, enabled: true })
      }
    } catch {
      // corrupt state file — start fresh
    }
  }

  private persist(): void {
    try {
      writeFileSync(
        this.stateFile,
        JSON.stringify({ ...this.config, notified: [...this.notified] })
      )
    } catch {}
  }

  configure(config: AlarmConfig): void {
    this.config = {
      enabled: config.enabled === true,
      remindMinutes: Math.max(0, Math.min(1440, config.remindMinutes)),
      platform: config.platform,
    }
    this.persist()
    this.stopRefresh()
    this.clearTimers()
    if (!this.config.enabled) return
    this.schedule()
    this.refreshTimer = setInterval(() => this.schedule(), 30 * 60 * 1000)
  }

  getConfig(): AlarmConfig {
    return { ...this.config }
  }

  private async schedule(): Promise<void> {
    if (!this.config.enabled || this.refreshing) return
    this.refreshing = true
    try {
      this.contests = await platformFetch[this.config.platform]()
    } catch {
      // keep last known contests; retry on next refresh tick
    } finally {
      this.refreshing = false
    }
    this.clearTimers()
    if (!this.config.enabled) return

    const now = Date.now()
    const remindMs = this.config.remindMinutes * 60 * 1000

    const upcoming = this.contests
      .filter((c) => c.startTime + c.duration > now)
      .sort((a, b) => a.startTime - b.startTime)

    for (const contest of upcoming) {
      const id = contestId(contest)

      // Reminder at start - remindMinutes.
      if (!this.notified.has(id)) {
        const triggerAt = contest.startTime - remindMs
        const delay = triggerAt - now
        if (delay > MAX_TIMEOUT) {
          // Far-future contest: setTimeout would overflow and fire immediately.
          // Leave it unarmed; the periodic refresh will re-arm it once the
          // delay shrinks below the 32-bit limit.
        } else if (delay > 0) {
          this.timers.set(
            id,
            setTimeout(() => this.fire(contest), delay)
          )
        } else if (now < contest.startTime) {
          // Reminder window already passed but the contest hasn't started yet —
          // notify immediately so enabling late still alerts the user. Show the
          // real remaining time, not the (wrong) configured lead time.
          const minsLeft = Math.max(1, Math.ceil((contest.startTime - Date.now()) / 60000))
          this.fire(contest, minsLeft)
        }
      }

      // "Live now" notification exactly at start time.
      const liveId = `live:${id}`
      if (!this.notified.has(liveId) && contest.startTime > now) {
        const delay = contest.startTime - now
        if (delay <= MAX_TIMEOUT) {
          this.timers.set(
            liveId,
            setTimeout(() => this.fireLive(contest), delay)
          )
        }
      }
    }
  }

  private fire(contest: Contest, minutesRemaining?: number): void {
    const id = contestId(contest)
    if (this.notified.has(id)) return
    this.notified.add(id)
    this.timers.delete(id)
    const minutes = minutesRemaining ?? this.config.remindMinutes
    const notification = new Notification({
      title: 'Contest Reminder',
      body: `${contest.title} on ${contest.platform} starts in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    })
    notification.on('click', () => {
      shell.openExternal(contest.url)
    })
    notification.show()
    this.persist()
  }

  private fireLive(contest: Contest): void {
    const id = `live:${contestId(contest)}`
    if (this.notified.has(id)) return
    this.notified.add(id)
    this.timers.delete(id)
    const notification = new Notification({
      title: 'Contest Started',
      body: `${contest.title} on ${contest.platform} is live now!`,
    })
    notification.on('click', () => {
      shell.openExternal(contest.url)
    })
    notification.show()
    this.persist()
  }

  private clearTimers(): void {
    for (const timer of this.timers.values()) clearTimeout(timer)
    this.timers.clear()
  }

  private stopRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }
}

export const alarmManager = new AlarmManager()