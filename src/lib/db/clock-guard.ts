// Monotonic date guard. Activity and daily-target dates come straight from the
// system clock. If the clock ever jumps backward (CMOS/battery reset, timezone
// shift, or a manual change), new "today" solves would be stamped onto an
// already-recorded past day — corrupting streaks, heatmaps, and daily targets.
// To prevent that, we keep a floor equal to the newest date ever written and
// clamp clock-derived writes to never go behind it. Legitimate past-date writes
// (submission backfills, the retroactive "yesterday" todo log) opt out via
// ignoreClockGuard.

import { execute, queryAll } from './connection'

const CLOCK_FLOOR_KEY = 'mi_last_written_date'
const CLOCK_GUARD_NOTE_KEY = 'mi_clock_guard_note'

function clockFloor(): string | null {
  const rows = queryAll<{ value: string }>('SELECT value FROM settings WHERE key = ?', [CLOCK_FLOOR_KEY])
  return rows.length > 0 ? String(rows[0].value) : null
}

export function bumpClockFloor(date: string): void {
  const current = clockFloor()
  if (!current || date > current) {
    execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [CLOCK_FLOOR_KEY, date])
  }
}

export function protectDate(date: string, ignoreGuard: boolean): string {
  if (ignoreGuard) return date
  const floor = clockFloor()
  if (floor && date < floor) {
    try {
      execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
        CLOCK_GUARD_NOTE_KEY,
        `Your system clock reported ${date}, but activity up to ${floor} was already recorded. New solves were saved under ${floor} instead of corrupting past days. Check your date & time settings.`,
      ])
    } catch {
      // note is best-effort
    }
    return floor
  }
  return date
}