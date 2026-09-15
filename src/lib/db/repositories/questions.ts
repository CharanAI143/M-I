// Company question bank. Each question is stored as a JSON blob in `data`;
// saveQuestions is a bulk upsert used to persist custom question edits.

import type { MockQuestion } from '@/lib/types'

import { ensureReady, execute, queryAll, safeParse, schedulePersist } from '../connection'

export async function loadQuestions(): Promise<MockQuestion[]> {
  await ensureReady()
  const rows = queryAll<{ data: string }>('SELECT data FROM mock_questions ORDER BY id')
  return rows
    .map((r) => safeParse<MockQuestion | null>(r.data, null))
    .filter((q): q is MockQuestion => Boolean(q))
}

export async function saveQuestions(questions: MockQuestion[]): Promise<void> {
  await ensureReady()
  const now = new Date().toISOString()
  for (const q of questions) {
    execute('INSERT OR REPLACE INTO mock_questions (id, data, updated_at) VALUES (?, ?, ?)', [
      q.id,
      JSON.stringify(q),
      now,
    ])
  }
  schedulePersist()
}