// Goal rows. The `questions` payload is stored as JSON text and hydrated back
// on load; active goals sort before achieved/archived ones.

import type { Goal, MockQuestion } from '@/lib/types'

import { ensureReady, execute, queryAll, lastInsertId, safeParse, schedulePersist } from '../connection'
import { buildUpdateSet } from '../query-helpers'

export async function loadGoals(): Promise<Goal[]> {
  await ensureReady()
  const rows = queryAll<any>('SELECT * FROM goals ORDER BY CASE status WHEN "active" THEN 0 ELSE 1 END, id DESC')
  return rows.map((r) => ({
    id: Number(r.id),
    title: r.title,
    type: r.type as Goal['type'],
    category: r.category as Goal['category'],
    target_value: Number(r.target_value),
    current_value: Number(r.current_value),
    unit: r.unit,
    start_date: r.start_date,
    end_date: r.end_date,
    status: r.status as Goal['status'],
    questions: safeParse<MockQuestion[]>(r.questions, []),
    created_at: r.created_at,
  }))
}

export async function addGoal(goal: Omit<Goal, 'id' | 'created_at'>): Promise<number> {
  await ensureReady()
  execute(
    'INSERT INTO goals (title, type, category, target_value, current_value, unit, start_date, end_date, status, questions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      goal.title,
      goal.type,
      goal.category,
      goal.target_value,
      goal.current_value,
      goal.unit,
      goal.start_date,
      goal.end_date,
      goal.status,
      JSON.stringify(goal.questions ?? []),
    ]
  )
  schedulePersist()
  return lastInsertId()
}

export async function updateGoal(id: number, data: Partial<Goal>): Promise<void> {
  await ensureReady()
  const keys = Object.keys(data)
  if (keys.length === 0) return
  const setClause = buildUpdateSet(keys)
  const values = keys.map((k) => {
    const v = (data as Record<string, unknown>)[k] as string | number | null
    if (k === 'questions' && Array.isArray(v)) return JSON.stringify(v)
    return v
  })
  execute(`UPDATE goals SET ${setClause} WHERE id = ?`, [...values, id])
  schedulePersist()
}

export async function deleteGoal(id: number): Promise<void> {
  await ensureReady()
  execute('DELETE FROM goals WHERE id = ?', [id])
  schedulePersist()
}