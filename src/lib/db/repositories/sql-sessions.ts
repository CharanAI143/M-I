// Interactive SQL practice sessions (the Sql module's mock-exam history). JSON
// blobs (questions/answers/results) are hydrated into typed arrays on load.

import type { SqlPracticeSession } from '@/lib/types'

import { ensureReady, execute, queryAll, safeParse, schedulePersist } from '../connection'

export async function loadSqlSessions(): Promise<SqlPracticeSession[]> {
  await ensureReady()
  const rows = queryAll<any>('SELECT * FROM sql_practice_sessions ORDER BY id DESC')
  return rows.map((r) => ({
    id: Number(r.id),
    title: r.title,
    difficulty: r.difficulty,
    topic: r.topic,
    total_questions: Number(r.total_questions),
    solved: Number(r.solved),
    wrong: Number(r.wrong),
    skipped: Number(r.skipped),
    duration_minutes: Number(r.duration_minutes ?? 30),
    elapsed_seconds: Number(r.elapsed_seconds),
    questions: safeParse<SqlPracticeSession['questions']>(r.questions, []),
    answers: safeParse<Record<string, string>>(r.answers, {}),
    results: safeParse<SqlPracticeSession['results']>(r.results, []),
    score: Number(r.score),
    status: r.status,
    started_at: r.started_at,
    ended_at: r.ended_at,
    created_at: r.created_at,
  }))
}

export async function addSqlSession(session: Omit<SqlPracticeSession, 'id' | 'created_at'>): Promise<void> {
  await ensureReady()
  execute(
    'INSERT INTO sql_practice_sessions (title, difficulty, topic, total_questions, solved, wrong, skipped, duration_minutes, elapsed_seconds, questions, answers, results, score, status, started_at, ended_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      session.title,
      session.difficulty,
      session.topic,
      session.total_questions,
      session.solved,
      session.wrong,
      session.skipped,
      session.duration_minutes,
      session.elapsed_seconds,
      JSON.stringify(session.questions),
      JSON.stringify(session.answers),
      JSON.stringify(session.results ?? []),
      session.score,
      session.status,
      session.started_at,
      session.ended_at,
    ]
  )
  schedulePersist()
}

export async function deleteSqlSession(id: number): Promise<void> {
  await ensureReady()
  execute('DELETE FROM sql_practice_sessions WHERE id = ?', [id])
  schedulePersist()
}