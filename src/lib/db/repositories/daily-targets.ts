// Daily problem-target rows. ensureDailyTarget creates today's row with the
// built-in default targets (3 easy / 2 medium / 1 hard) on first call of the
// day, the same defaults the schema declares.

import type { DailyTarget } from '@/lib/types'
import { getToday } from '@/lib/utils'

import { ensureReady, execute, queryAll, schedulePersist } from '../connection'
import { bumpClockFloor, protectDate } from '../clock-guard'
import { buildUpdateSet } from '../query-helpers'

export async function ensureDailyTarget(): Promise<DailyTarget> {
  await ensureReady()
  const today = protectDate(getToday(), false)
  let rows = queryAll<DailyTarget>('SELECT * FROM daily_targets WHERE date = ?', [today])
  if (rows.length === 0) {
    execute(
      'INSERT INTO daily_targets (date, easy_target, easy_done, medium_target, medium_done, hard_target, hard_done) VALUES (?, 3, 0, 2, 0, 1, 0)',
      [today]
    )
    bumpClockFloor(today)
    schedulePersist()
    rows = queryAll<DailyTarget>('SELECT * FROM daily_targets WHERE date = ?', [today])
  }
  return rows[0]
}

export async function updateDailyTarget(id: number, data: Partial<DailyTarget>): Promise<void> {
  await ensureReady()
  const keys = Object.keys(data)
  if (keys.length === 0) return
  const setClause = buildUpdateSet(keys)
  const values = keys.map((k) => (data as Record<string, unknown>)[k] as string | number | null)
  execute(`UPDATE daily_targets SET ${setClause} WHERE id = ?`, [...values, id])
  schedulePersist()
}