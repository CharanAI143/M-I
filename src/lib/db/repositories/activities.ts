// Daily solves per platform per day. logActivity is an upsert keyed on
// (platform, date) and both logActivity and ensureDailyTarget engage the clock
// guard (see db/clock-guard.ts).

import type { ActivityLog } from '@/lib/types'
import { getToday } from '@/lib/utils'

import { ensureReady, execute, queryAll, schedulePersist } from '../connection'
import { bumpClockFloor, protectDate } from '../clock-guard'

export async function loadActivities(): Promise<ActivityLog[]> {
  await ensureReady()
  return queryAll<ActivityLog>('SELECT * FROM activity_logs')
}

export async function logActivity(
  platform: string,
  problems: number,
  easy: number,
  medium: number,
  hard: number,
  date?: string,
  opts?: { ignoreClockGuard?: boolean }
): Promise<void> {
  await ensureReady()
  const activityDate = protectDate(date ?? getToday(), opts?.ignoreClockGuard === true)

  const existing = queryAll<{ id: number }>(
    'SELECT * FROM activity_logs WHERE platform = ? AND date = ?',
    [platform, activityDate]
  )
  if (existing.length > 0) {
    execute(
      'UPDATE activity_logs SET problems_solved = ?, easy = ?, medium = ?, hard = ? WHERE id = ?',
      [problems, easy, medium, hard, existing[0].id]
    )
  } else {
    execute(
      'INSERT INTO activity_logs (platform, date, problems_solved, easy, medium, hard) VALUES (?, ?, ?, ?, ?, ?)',
      [platform, activityDate, problems, easy, medium, hard]
    )
  }
  bumpClockFloor(activityDate)
  schedulePersist()
}

// Remove activity rows created by the old sync behavior. Sync used to log a
// platform's cumulative total as "today's solved" on every sync, which
// inflated the streak from merely opening the app. The only genuine daily
// activity is recorded under the 'todo' platform (plus 'sql' for interactive
// SQL practice), so everything else gets pruned.
export async function pruneSyncActivities(): Promise<void> {
  await ensureReady()
  execute("DELETE FROM activity_logs WHERE platform NOT IN ('todo', 'sql')")
  schedulePersist()
}