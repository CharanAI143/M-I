// Generic key/value store backed by the settings table. Used for small
// application state (flags, preferences) that doesn't warrant its own table.

import { ensureReady, execute, queryAll, schedulePersist } from './connection'

export const dbStore = {
  async get(key: string): Promise<any> {
    await ensureReady()
    const rows = queryAll<any>('SELECT value FROM settings WHERE key = ?', [key])
    return rows.length > 0 ? rows[0].value : undefined
  },

  async set(key: string, value: any): Promise<void> {
    await ensureReady()
    execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)])
    schedulePersist()
  },

  async delete(key: string): Promise<void> {
    await ensureReady()
    execute('DELETE FROM settings WHERE key = ?', [key])
    schedulePersist()
  },
}