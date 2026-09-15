// Mock-interview session rows. JSON blobs (questions/notes/results) are
// hydrated into typed arrays on load.

import type { MockInterviewSession, MockQuestion } from '@/lib/types'

import { ensureReady, execute, queryAll, safeParse, schedulePersist } from '../connection'

export async function loadMockInterviews(): Promise<MockInterviewSession[]> {
  await ensureReady()
  const rows = queryAll<any>('SELECT * FROM mock_interviews ORDER BY id DESC')
  return rows.map((r) => ({
    id: Number(r.id),
    title: r.title,
    difficulty: r.difficulty,
    topic: r.topic,
    total_questions: Number(r.total_questions),
    solved: Number(r.solved),
    skipped: Number(r.skipped),
    duration_minutes: Number(r.duration_minutes),
    elapsed_seconds: Number(r.elapsed_seconds),
    questions: safeParse<MockQuestion[]>(r.questions, []),
    notes: safeParse<Record<string, string>>(r.notes, {}),
    results: safeParse<Array<'solved' | 'skipped' | null>>(r.results, []),
    score: Number(r.score),
    status: r.status,
    started_at: r.started_at,
    ended_at: r.ended_at,
    created_at: r.created_at,
  }))
}

export async function addMockInterview(session: Omit<MockInterviewSession, 'id' | 'created_at'>): Promise<void> {
  await ensureReady()
  execute(
    'INSERT INTO mock_interviews (title, difficulty, topic, total_questions, solved, skipped, duration_minutes, elapsed_seconds, questions, notes, results, score, status, started_at, ended_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      session.title,
      session.difficulty,
      session.topic,
      session.total_questions,
      session.solved,
      session.skipped,
      session.duration_minutes,
      session.elapsed_seconds,
      JSON.stringify(session.questions),
      JSON.stringify(session.notes),
      JSON.stringify(session.results ?? []),
      session.score,
      session.status,
      session.started_at,
      session.ended_at,
    ]
  )
  schedulePersist()
}

export async function deleteMockInterview(id: number): Promise<void> {
  await ensureReady()
  execute('DELETE FROM mock_interviews WHERE id = ?', [id])
  schedulePersist()
}