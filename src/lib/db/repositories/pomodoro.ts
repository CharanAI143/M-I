// Pomodoro focus-session logs (the Planner module's timer history).

import type { PomodoroLog } from '@/lib/types'

import { ensureReady, execute, queryAll, schedulePersist } from '../connection'

export async function loadPomodoroLogs(): Promise<PomodoroLog[]> {
  await ensureReady()
  const rows = queryAll<any>('SELECT * FROM pomodoro_logs ORDER BY id DESC')
  return rows.map((r) => ({
    id: Number(r.id),
    type: r.type as PomodoroLog['type'],
    duration_minutes: Number(r.duration_minutes),
    completed: Number(r.completed),
    started_at: r.started_at,
    ended_at: r.ended_at,
    created_at: r.created_at,
  }))
}

export async function addPomodoroLog(log: Omit<PomodoroLog, 'id' | 'created_at'>): Promise<void> {
  await ensureReady()
  execute('INSERT INTO pomodoro_logs (type, duration_minutes, completed, started_at, ended_at) VALUES (?, ?, ?, ?, ?)', [
    log.type,
    log.duration_minutes,
    log.completed,
    log.started_at,
    log.ended_at,
  ])
  schedulePersist()
}