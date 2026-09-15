// Owns the single sql.js database instance and the byte-level lifecycle:
// init, load from disk/localStorage, debounced export/persist, and hard reset.
// Repositories never touch sql.js initialization directly — they ask for the
// ready database via ensureReady() and run statements through the helpers here.

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

import { runMigrations } from './migrations'
import { listTables } from './query-helpers'

export type Params = Array<string | number | null>

export const LEGACY_STORAGE_KEY = 'mi-tracker-db'

let SQL: SqlJsStatic | null = null
let db: Database | null = null
let readyPromise: Promise<Database> | null = null

function encode(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function decode(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function hasElectronBridge(): boolean {
  return typeof window.electron?.ipcRenderer?.invoke === 'function'
}

// Persistence is debounced so rapid writes (typing notes, toggling todos)
// don't serialize + re-encode the whole database on every keystroke. The
// trailing timer flushes shortly after the last write; beforeunload/pagehide/
// visibility:hidden also flush immediately so no recent work is lost on close.
const PERSIST_DEBOUNCE_MS = 800
let persistTimer: ReturnType<typeof setTimeout> | null = null

function doPersist() {
  if (!db) return
  try {
    const bytes = db.export()
    const b64 = encode(bytes)

    // Primary persistence: write the database to a file on disk via the main
    // process.  This avoids the 5 MB localStorage quota and is safe when
    // multiple windows or instances are open.
    if (hasElectronBridge()) {
      window.electron.ipcRenderer.invoke('db:save', b64).catch((e: unknown) => {
        console.error('Failed to save database to file:', e)
      })
    }

    // Backup: also keep the database in localStorage so the app still works
    // in a plain browser (dev mode without Electron) and provides a fallback
    // if the IPC write fails.
    try {
      localStorage.setItem(LEGACY_STORAGE_KEY, b64)
    } catch {
      // localStorage quota exceeded — not critical when file persistence is active
    }
  } catch (e) {
    console.error('Failed to persist database:', e)
  }
}

export function schedulePersist() {
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    persistTimer = null
    doPersist()
  }, PERSIST_DEBOUNCE_MS)
}

export function cancelPersist() {
  if (persistTimer) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
}

export function flushPersist() {
  cancelPersist()
  doPersist()
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushPersist)
  window.addEventListener('pagehide', flushPersist)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushPersist()
    })
  }
}

export async function ensureReady(): Promise<Database> {
  if (db) return db
  if (readyPromise) return readyPromise

  readyPromise = (async () => {
    SQL = await initSqlJs({ locateFile: () => wasmUrl })

    // Try to load the database from the file on disk first (via IPC).
    // If the file doesn't exist, fall back to localStorage (migration path
    // from the old persistence strategy).
    let saved: string | null = null

    if (hasElectronBridge()) {
      try {
        saved = await window.electron.ipcRenderer.invoke('db:load')
      } catch (e) {
        console.error('Failed to load database file via IPC:', e)
      }
    }

    // Migration: if no file exists on disk, try to recover data from the
    // legacy localStorage key and write it to the file for future loads.
    if (!saved) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacy) {
        saved = legacy
        // Write to file so subsequent loads use the file directly
        if (hasElectronBridge()) {
          window.electron.ipcRenderer.invoke('db:save', legacy).catch(() => {})
        }
      }
    }

    if (saved) {
      try {
        db = new SQL.Database(decode(saved))
      } catch (e) {
        console.error('Failed to load saved database, creating fresh one:', e)
        db = new SQL.Database()
      }
    } else {
      db = new SQL.Database()
    }

    // Apply schema + column migrations and seed the built-in question bank when
    // it is empty. A `true` return means the bank was seeded, so persist the
    // fresh state.
    if (runMigrations(db)) schedulePersist()

    return db
  })()

  return readyPromise
}

export function queryAll<T = Record<string, any>>(sql: string, params: Params = []): T[] {
  const stmt = db!.prepare(sql)
  try {
    stmt.bind(params)
    const rows: T[] = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as T)
    }
    return rows
  } finally {
    stmt.free()
  }
}

export function runSql(sql: string, params: Params = []) {
  db!.run(sql, params)
}

export function execute(sql: string, params: Params = []) {
  const stmt = db!.prepare(sql)
  try {
    stmt.run(params)
  } finally {
    stmt.free()
  }
}

export function lastInsertId(): number {
  const rows = queryAll<{ id: number }>('SELECT last_insert_rowid() as id')
  return Number(rows[0]?.id ?? 0)
}

export function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function resetAllData(): Promise<void> {
  await ensureReady()
  cancelPersist()

  // Wipe every user table (discovered at runtime so new tables added later are
  // covered automatically). Equivalent to the old hardcoded DELETE list; the
  // SQLite internal tables (sqlite_*) are excluded by listTables().
  for (const table of listTables(db!)) {
    runSql(`DELETE FROM ${table}`)
  }

  // Delete the database file on disk FIRST (before persist writes a new one).
  if (hasElectronBridge()) {
    try {
      await window.electron.ipcRenderer.invoke('db:reset')
    } catch {
      // ignore
    }
  }

  localStorage.removeItem(LEGACY_STORAGE_KEY)
  localStorage.removeItem('mi_theme')
  localStorage.removeItem('mi_color_scheme')
  localStorage.removeItem('mi_api_key_locked')

  // Clear the in-memory DB so the next ensureReady() call re-initializes
  // with a fresh schema.
  db!.close()
  db = null
  readyPromise = null
}