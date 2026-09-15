// Notes. Soft-deleted via the `deleted` flag; ids are client-generated
// (note_<timestamp>) to work offline before the first insert returns.
// saveNote is an upsert keyed on the id.

import type { Note } from '@/lib/types'

import { ensureReady, execute, queryAll, schedulePersist } from '../connection'

export async function loadNotes(): Promise<Note[]> {
  await ensureReady()
  return queryAll<Note>('SELECT * FROM notes WHERE deleted = 0 OR deleted IS NULL')
}

export async function saveNote(note: Partial<Note>): Promise<void> {
  await ensureReady()
  const now = new Date().toISOString()
  if (note.id) {
    const existing = queryAll<{ id: string }>('SELECT * FROM notes WHERE id = ?', [note.id])
    if (existing.length > 0) {
      execute('UPDATE notes SET title = ?, content = ?, drawing = ?, updatedAt = ? WHERE id = ?', [
        note.title ?? '',
        note.content ?? '',
        note.drawing ?? '',
        now,
        note.id,
      ])
    } else {
      execute(
        'INSERT INTO notes (id, title, content, drawing, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [note.id, note.title ?? 'Untitled', note.content ?? '', note.drawing ?? '', now, now]
      )
    }
  } else {
    const id = note.id ?? `note_${Date.now().toString(36)}`
    execute(
      'INSERT INTO notes (id, title, content, drawing, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, note.title ?? 'Untitled', note.content ?? '', note.drawing ?? '', now, now]
    )
  }
  schedulePersist()
}

export async function deleteNote(id: string): Promise<void> {
  await ensureReady()
  execute('UPDATE notes SET deleted = 1 WHERE id = ?', [id])
  schedulePersist()
}