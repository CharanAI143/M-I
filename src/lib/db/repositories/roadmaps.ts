// Roadmap rows generated from course URLs; the actual roadmap payload is kept
// as JSON text in `roadmap_data`.

import type { Roadmap } from '@/lib/types'

import { ensureReady, execute, queryAll, schedulePersist } from '../connection'

export async function loadRoadmaps(): Promise<Roadmap[]> {
  await ensureReady()
  return queryAll<Roadmap>('SELECT * FROM roadmaps')
}

export async function addRoadmap(roadmap: Omit<Roadmap, 'id' | 'created_at'>): Promise<void> {
  await ensureReady()
  execute('INSERT INTO roadmaps (course_name, course_url, is_coding, roadmap_data) VALUES (?, ?, ?, ?)', [
    roadmap.course_name,
    roadmap.course_url ?? '',
    roadmap.is_coding ?? 0,
    roadmap.roadmap_data ?? '',
  ])
  schedulePersist()
}

export async function deleteRoadmap(id: number): Promise<void> {
  await ensureReady()
  execute('DELETE FROM roadmaps WHERE id = ?', [id])
  schedulePersist()
}