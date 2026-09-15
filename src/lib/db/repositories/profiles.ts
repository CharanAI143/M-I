// Profile rows: platform identifiers, solved-count snapshots, and GitHub
// metadata. updateProfile is an upsert that derives its columns dynamically.

import type { Profile } from '@/lib/types'

import { ensureReady, execute, queryAll, type Params, schedulePersist } from '../connection'
import { buildInsert, buildUpdateSet } from '../query-helpers'

export async function loadProfiles(): Promise<Profile[]> {
  await ensureReady()
  return queryAll<Profile>('SELECT * FROM profiles')
}

export async function updateProfile(platform: string, data: Partial<Profile>): Promise<void> {
  await ensureReady()
  const record = { ...data } as Record<string, unknown>
  delete record.platform

  const existing = queryAll<{ id: number }>('SELECT * FROM profiles WHERE platform = ?', [platform])
  if (existing.length > 0) {
    const keys = Object.keys(record).filter((k) => record[k] !== undefined) as string[]
    const id = existing[0].id
    if (keys.length > 0) {
      const setClause = buildUpdateSet(keys)
      const values = keys.map((k) => record[k] as string | number | null)
      execute(`UPDATE profiles SET ${setClause} WHERE id = ?`, [...values, id])
    }
  } else {
    const keys: string[] = ['platform']
    const values: Params = [platform]
    if (!record.username) {
      keys.push('username')
      values.push(platform)
    }
    for (const k of Object.keys(record)) {
      if (record[k] !== undefined) {
        keys.push(k)
        values.push(record[k] as string | number | null)
      }
    }
    const { cols, placeholders } = buildInsert(keys)
    execute(`INSERT INTO profiles (${cols}) VALUES (${placeholders})`, values)
  }
  schedulePersist()
}