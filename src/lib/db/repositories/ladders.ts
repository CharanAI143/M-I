// Codeforces ladder rows. `problems` is hydrated from JSON on load, and the
// most recently opened ladder bubbles to the top (NULLS LAST keeps never-opened
// ladders below).

import type { Ladder } from '@/lib/types'

import { ensureReady, execute, queryAll, lastInsertId, safeParse, schedulePersist } from '../connection'

export async function loadLadders(handle: string): Promise<Ladder[]> {
  await ensureReady()
  const rows = queryAll<any>(
    'SELECT * FROM ladders WHERE handle = ? ORDER BY last_opened DESC NULLS LAST, created_at DESC',
    [handle]
  )
  return rows.map((r) => ({
    id: Number(r.id),
    platform: r.platform,
    handle: r.handle,
    name: r.name,
    min_rating: Number(r.min_rating),
    max_rating: Number(r.max_rating),
    problems: safeParse<Ladder['problems']>(r.problems, []),
    created_at: r.created_at,
    last_opened: r.last_opened ?? null,
  }))
}

export async function addLadder(ladder: Omit<Ladder, 'id' | 'created_at' | 'last_opened'>): Promise<number> {
  await ensureReady()
  execute(
    'INSERT INTO ladders (platform, handle, name, min_rating, max_rating, problems) VALUES (?, ?, ?, ?, ?, ?)',
    [ladder.platform, ladder.handle, ladder.name, ladder.min_rating, ladder.max_rating, JSON.stringify(ladder.problems)]
  )
  schedulePersist()
  return lastInsertId()
}

export async function deleteLadder(id: number): Promise<void> {
  await ensureReady()
  execute('DELETE FROM ladders WHERE id = ?', [id])
  schedulePersist()
}

export async function touchLadder(id: number): Promise<void> {
  await ensureReady()
  execute('UPDATE ladders SET last_opened = datetime(?) WHERE id = ?', [new Date().toISOString(), id])
  schedulePersist()
}