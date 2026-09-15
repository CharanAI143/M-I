import type { Note } from '@/lib/types'

export const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ffffff'] as const

export const STROKE_WIDTHS = [
  { label: 'Thin', value: 2 },
  { label: 'Medium', value: 5 },
  { label: 'Thick', value: 10 },
] as const

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}