import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import type { ActivityLog, Course, DailyTarget, Goal, Ladder, MockInterviewSession, MockQuestion, Note, Profile, PomodoroLog, Roadmap, SqlPracticeSession } from '@/lib/types'
import { getToday } from '@/lib/utils'
import { DEFAULT_QUESTION_BANK } from '@/lib/interview'

const LEGACY_STORAGE_KEY = 'mi-tracker-db'

type Params = Array<string | number | null>

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

function persist() {
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    persistTimer = null
    doPersist()
  }, PERSIST_DEBOUNCE_MS)
}

function cancelPersist() {
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

async function ensureReady(): Promise<Database> {
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

    db.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL,
        date TEXT NOT NULL,
        problems_solved INTEGER DEFAULT 0,
        easy INTEGER DEFAULT 0,
        medium INTEGER DEFAULT 0,
        hard INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL UNIQUE,
        username TEXT,
        total_solved INTEGER DEFAULT 0,
        easy_solved INTEGER DEFAULT 0,
        medium_solved INTEGER DEFAULT 0,
        hard_solved INTEGER DEFAULT 0,
        rank TEXT,
        rating INTEGER DEFAULT 0,
        last_synced TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT DEFAULT 'Untitled',
        content TEXT,
        drawing TEXT,
        thumbnail TEXT,
        deleted INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT,
        total_modules INTEGER DEFAULT 0,
        completed_modules INTEGER DEFAULT 0,
        status TEXT DEFAULT 'ongoing',
        notes TEXT,
        modules TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS daily_targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        easy_target INTEGER DEFAULT 3,
        easy_done INTEGER DEFAULT 0,
        medium_target INTEGER DEFAULT 2,
        medium_done INTEGER DEFAULT 0,
        hard_target INTEGER DEFAULT 1,
        hard_done INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS roadmaps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT NOT NULL,
        course_url TEXT,
        is_coding INTEGER DEFAULT 0,
        roadmap_data TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS ladders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL,
        handle TEXT NOT NULL,
        name TEXT NOT NULL,
        min_rating INTEGER,
        max_rating INTEGER,
        problems TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        last_opened TEXT
      );

      CREATE TABLE IF NOT EXISTS mock_interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        difficulty TEXT DEFAULT 'Mixed',
        topic TEXT DEFAULT 'All Topics',
        total_questions INTEGER DEFAULT 0,
        solved INTEGER DEFAULT 0,
        skipped INTEGER DEFAULT 0,
        duration_minutes INTEGER DEFAULT 45,
        elapsed_seconds INTEGER DEFAULT 0,
        questions TEXT DEFAULT '[]',
        notes TEXT DEFAULT '{}',
        score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'completed',
        started_at TEXT DEFAULT (datetime('now')),
        ended_at TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        target_value INTEGER DEFAULT 0,
        current_value INTEGER DEFAULT 0,
        unit TEXT DEFAULT '',
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS mock_questions (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS pomodoro_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 25,
        completed INTEGER DEFAULT 1,
        started_at TEXT DEFAULT (datetime('now')),
        ended_at TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sql_practice_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        difficulty TEXT DEFAULT 'Mixed',
        topic TEXT DEFAULT 'All Topics',
        total_questions INTEGER DEFAULT 0,
        solved INTEGER DEFAULT 0,
        wrong INTEGER DEFAULT 0,
        skipped INTEGER DEFAULT 0,
        duration_minutes INTEGER DEFAULT 30,
        elapsed_seconds INTEGER DEFAULT 0,
        questions TEXT DEFAULT '[]',
        answers TEXT DEFAULT '{}',
        results TEXT DEFAULT '[]',
        score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'completed',
        started_at TEXT DEFAULT (datetime('now')),
        ended_at TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
`)

    // Migration: add last_opened column to ladders if missing
    try {
      db.run(`ALTER TABLE ladders ADD COLUMN last_opened TEXT`)
    } catch {
      // column already exists
    }

    // Migration: add results column to mock_interviews if missing
    try {
      db.run(`ALTER TABLE mock_interviews ADD COLUMN results TEXT DEFAULT '[]'`)
    } catch {
      // column already exists
    }

    // Migration: add questions column to goals if missing
    try {
      db.run(`ALTER TABLE goals ADD COLUMN questions TEXT DEFAULT '[]'`)
    } catch {
      // column already exists
    }

    // Migration: GitHub-specific columns on profiles
    const profileColumns: { name: string; type: string }[] = [
      { name: 'stars', type: 'INTEGER DEFAULT 0' },
      { name: 'followers', type: 'INTEGER DEFAULT 0' },
      { name: 'following', type: 'INTEGER DEFAULT 0' },
      { name: 'public_repos', type: 'INTEGER DEFAULT 0' },
      { name: 'avatar_url', type: 'TEXT' },
      { name: 'name', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' },
      { name: 'location', type: 'TEXT' },
      { name: 'blog', type: 'TEXT' },
      { name: 'top_languages', type: 'TEXT' },
      { name: 'top_repos', type: 'TEXT' },
    ]
    for (const col of profileColumns) {
      try {
        db.run(`ALTER TABLE profiles ADD COLUMN ${col.name} ${col.type}`)
      } catch {
        // column already exists
      }
    }

    // Migration: add modules column to courses if missing
    try {
      db.run(`ALTER TABLE courses ADD COLUMN modules TEXT`)
    } catch {
      // column already exists
    }

    // Migration: add started_at column to courses if missing
    try {
      db.run(`ALTER TABLE courses ADD COLUMN started_at TEXT`)
    } catch {
      // column already exists
    }

    // Migration: add last_active_at column to courses if missing
    try {
      db.run(`ALTER TABLE courses ADD COLUMN last_active_at TEXT`)
    } catch {
      // column already exists
    }

    // Migration: add duration_minutes column to sql_practice_sessions if missing
    try {
      db.run(`ALTER TABLE sql_practice_sessions ADD COLUMN duration_minutes INTEGER DEFAULT 30`)
    } catch {
      // column already exists
    }

    // Seed the company question bank with the built-in questions when empty.
    const bankCount = db.exec('SELECT COUNT(*) AS c FROM mock_questions')[0]?.values[0]?.[0] ?? 0
    if (Number(bankCount) === 0) {
      const insert = db.prepare('INSERT INTO mock_questions (id, data, updated_at) VALUES (?, ?, ?)')
      try {
        const now = new Date().toISOString()
        for (const q of DEFAULT_QUESTION_BANK) {
          insert.run([q.id, JSON.stringify(q), now])
        }
      } finally {
        insert.free()
      }
      persist()
    }

    return db
  })()

  return readyPromise
}

function queryAll(sql: string, params: Params = []): any[] {
  const stmt = db!.prepare(sql)
  try {
    stmt.bind(params)
    const rows: any[] = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
    return rows
  } finally {
    stmt.free()
  }
}

function runSql(sql: string, params: Params = []) {
  db!.run(sql, params)
}

function execute(sql: string, params: Params = []) {
  const stmt = db!.prepare(sql)
  try {
    stmt.run(params)
  } finally {
    stmt.free()
  }
}

function lastInsertId(): number {
  const rows = queryAll('SELECT last_insert_rowid() as id')
  return Number(rows[0]?.id ?? 0)
}

function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function resetDatabase() {
  cancelPersist()
  localStorage.removeItem(LEGACY_STORAGE_KEY)
  if (hasElectronBridge()) {
    window.electron.ipcRenderer.invoke('db:reset').catch(() => {})
  }
}

// ── Monotonic date guard ─────────────────────────────────────────────────
// Activity and daily-target dates come straight from the system clock. If the
// clock ever jumps backward (CMOS/battery reset, timezone shift, or a manual
// change), new "today" solves would be stamped onto an already-recorded past
// day — corrupting streaks, heatmaps, and daily targets. To prevent that, we
// keep a floor equal to the newest date ever written and clamp clock-derived
// writes to never go behind it. Legitimate past-date writes (submission
// backfills, the retroactive "yesterday" todo log) opt out via ignoreClockGuard.
const CLOCK_FLOOR_KEY = 'mi_last_written_date'
const CLOCK_GUARD_NOTE_KEY = 'mi_clock_guard_note'

function clockFloor(): string | null {
  const rows = queryAll('SELECT value FROM settings WHERE key = ?', [CLOCK_FLOOR_KEY])
  return rows.length > 0 ? String(rows[0].value) : null
}

function bumpClockFloor(date: string): void {
  const current = clockFloor()
  if (!current || date > current) {
    execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [CLOCK_FLOOR_KEY, date])
  }
}

function protectDate(date: string, ignoreGuard: boolean): string {
  if (ignoreGuard) return date
  const floor = clockFloor()
  if (floor && date < floor) {
    try {
      execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
        CLOCK_GUARD_NOTE_KEY,
        `Your system clock reported ${date}, but activity up to ${floor} was already recorded. New solves were saved under ${floor} instead of corrupting past days. Check your date & time settings.`,
      ])
    } catch {
      // note is best-effort
    }
    return floor
  }
  return date
}

export const dbApi = {
  async loadProfiles(): Promise<Profile[]> {
    await ensureReady()
    return queryAll('SELECT * FROM profiles') as Profile[]
  },

  async loadActivities(): Promise<ActivityLog[]> {
    await ensureReady()
    return queryAll('SELECT * FROM activity_logs') as ActivityLog[]
  },

  async ensureDailyTarget(): Promise<DailyTarget> {
    await ensureReady()
    const today = protectDate(getToday(), false)
    let rows = queryAll('SELECT * FROM daily_targets WHERE date = ?', [today])
    if (rows.length === 0) {
      execute(
        'INSERT INTO daily_targets (date, easy_target, easy_done, medium_target, medium_done, hard_target, hard_done) VALUES (?, 3, 0, 2, 0, 1, 0)',
        [today]
      )
      bumpClockFloor(today)
      persist()
      rows = queryAll('SELECT * FROM daily_targets WHERE date = ?', [today])
    }
    return rows[0] as DailyTarget
  },

  async updateDailyTarget(id: number, data: Partial<DailyTarget>): Promise<void> {
    await ensureReady()
    const keys = Object.keys(data)
    if (keys.length === 0) return
    const setClause = keys.map((k) => `${k} = ?`).join(', ')
    const values = keys.map((k) => (data as any)[k])
    execute(`UPDATE daily_targets SET ${setClause} WHERE id = ?`, [...values, id])
    persist()
  },

  async loadCourses(): Promise<Course[]> {
    await ensureReady()
    const rows = queryAll('SELECT * FROM courses') as Course[]
    return rows.map((c) => {
      if (c.modules && typeof c.modules === 'string') {
        try {
          c.modules = JSON.parse(c.modules)
        } catch {
          c.modules = undefined
        }
      }
      if (!c.started_at) {
        c.started_at = c.created_at ?? new Date().toISOString()
      }
      if (!c.last_active_at) {
        c.last_active_at = c.started_at || c.created_at || new Date().toISOString()
      }
      return c
    })
  },

  async addCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    await ensureReady()
    const modulesJson = course.modules ? JSON.stringify(course.modules) : null
    const startedAt = course.started_at || new Date().toISOString()
    execute(
      'INSERT INTO courses (name, url, total_modules, completed_modules, status, notes, modules, started_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        course.name ?? '',
        course.url ?? '',
        course.total_modules ?? 0,
        course.completed_modules ?? 0,
        course.status ?? 'ongoing',
        course.notes ?? '',
        modulesJson,
        startedAt,
      ]
    )
    persist()
  },

  async updateCourse(id: number, data: Partial<Course>): Promise<void> {
    await ensureReady()
    const keys = Object.keys(data)
    if (keys.length === 0) return
    const setClause = keys.map((k) => `${k} = ?`).join(', ')
    const values = keys.map((k) => {
      const v = (data as any)[k]
      if (k === 'modules' && Array.isArray(v)) return JSON.stringify(v)
      return v
    })
    execute(`UPDATE courses SET ${setClause} WHERE id = ?`, [...values, id])
    persist()
  },

  async deleteCourse(id: number): Promise<void> {
    await ensureReady()
    execute('DELETE FROM courses WHERE id = ?', [id])
    persist()
  },

  async loadNotes(): Promise<Note[]> {
    await ensureReady()
    return queryAll('SELECT * FROM notes WHERE deleted = 0 OR deleted IS NULL') as Note[]
  },

  async saveNote(note: Partial<Note>): Promise<void> {
    await ensureReady()
    const now = new Date().toISOString()
    if (note.id) {
      const existing = queryAll('SELECT * FROM notes WHERE id = ?', [note.id])
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
    persist()
  },

  async deleteNote(id: string): Promise<void> {
    await ensureReady()
    execute('UPDATE notes SET deleted = 1 WHERE id = ?', [id])
    persist()
  },

  async loadRoadmaps(): Promise<Roadmap[]> {
    await ensureReady()
    return queryAll('SELECT * FROM roadmaps') as Roadmap[]
  },

  async addRoadmap(roadmap: Omit<Roadmap, 'id' | 'created_at'>): Promise<void> {
    await ensureReady()
    execute('INSERT INTO roadmaps (course_name, course_url, is_coding, roadmap_data) VALUES (?, ?, ?, ?)', [
      roadmap.course_name,
      roadmap.course_url ?? '',
      roadmap.is_coding ?? 0,
      roadmap.roadmap_data ?? '',
    ])
    persist()
  },

  async deleteRoadmap(id: number): Promise<void> {
    await ensureReady()
    execute('DELETE FROM roadmaps WHERE id = ?', [id])
    persist()
  },

  async logActivity(platform: string, problems: number, easy: number, medium: number, hard: number, date?: string, opts?: { ignoreClockGuard?: boolean }): Promise<void> {
    await ensureReady()
    const activityDate = protectDate(date ?? getToday(), opts?.ignoreClockGuard === true)
    const existing = queryAll('SELECT * FROM activity_logs WHERE platform = ? AND date = ?', [platform, activityDate])
    if (existing.length > 0) {
      execute('UPDATE activity_logs SET problems_solved = ?, easy = ?, medium = ?, hard = ? WHERE id = ?', [
        problems,
        easy,
        medium,
        hard,
        (existing[0] as any).id,
      ])
    } else {
      execute(
        'INSERT INTO activity_logs (platform, date, problems_solved, easy, medium, hard) VALUES (?, ?, ?, ?, ?, ?)',
        [platform, activityDate, problems, easy, medium, hard]
      )
    }
    bumpClockFloor(activityDate)
    persist()
  },

  // Remove activity rows created by the old sync behavior. Sync used to log a
  // platform's cumulative total as "today's solved" on every sync, which
  // inflated the streak from merely opening the app. The only genuine daily
  // activity is recorded under the 'todo' platform (plus 'sql' for interactive
  // SQL practice), so everything else gets pruned.
  async pruneSyncActivities(): Promise<void> {
    await ensureReady()
    execute("DELETE FROM activity_logs WHERE platform NOT IN ('todo', 'sql')")
    persist()
  },

  async updateProfile(platform: string, data: Partial<Profile>): Promise<void> {
    await ensureReady()
    const record = { ...data } as Record<string, unknown>
    delete record.platform
    const existing = queryAll('SELECT * FROM profiles WHERE platform = ?', [platform])
    if (existing.length > 0) {
      const keys = Object.keys(record).filter((k) => record[k] !== undefined) as string[]
      const id = (existing[0] as any).id
      if (keys.length > 0) {
        const setClause = keys.map((k) => `${k} = ?`).join(', ')
        const values = keys.map((k) => record[k])
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
          values.push(record[k] as any)
        }
      }
      const placeholders = keys.map(() => '?').join(', ')
      execute(`INSERT INTO profiles (${keys.join(', ')}) VALUES (${placeholders})`, values)
    }
    persist()
  },

  async run(sql: string, params: Params = []): Promise<void> {
    await ensureReady()
    runSql(sql, params)
    persist()
  },

  async loadLadders(handle: string): Promise<Ladder[]> {
    await ensureReady()
    const rows = queryAll('SELECT * FROM ladders WHERE handle = ? ORDER BY last_opened DESC NULLS LAST, created_at DESC', [handle])
    return rows.map((r: any) => ({
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
  },

  async addLadder(ladder: Omit<Ladder, 'id' | 'created_at' | 'last_opened'>): Promise<number> {
    await ensureReady()
    execute(
      'INSERT INTO ladders (platform, handle, name, min_rating, max_rating, problems) VALUES (?, ?, ?, ?, ?, ?)',
      [ladder.platform, ladder.handle, ladder.name, ladder.min_rating, ladder.max_rating, JSON.stringify(ladder.problems)]
    )
    persist()
    return lastInsertId()
  },

  async deleteLadder(id: number): Promise<void> {
    await ensureReady()
    execute('DELETE FROM ladders WHERE id = ?', [id])
    persist()
  },

  async touchLadder(id: number): Promise<void> {
    await ensureReady()
    execute('UPDATE ladders SET last_opened = datetime(?) WHERE id = ?', [new Date().toISOString(), id])
    persist()
  },

  // Mock Interviews
  async loadMockInterviews(): Promise<MockInterviewSession[]> {
    await ensureReady()
    const rows = queryAll('SELECT * FROM mock_interviews ORDER BY id DESC')
    return rows.map((r: any) => ({
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
  },

  async addMockInterview(session: Omit<MockInterviewSession, 'id' | 'created_at'>): Promise<void> {
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
    persist()
  },

  async deleteMockInterview(id: number): Promise<void> {
    await ensureReady()
    execute('DELETE FROM mock_interviews WHERE id = ?', [id])
    persist()
  },

  // Company question bank
  async loadQuestions(): Promise<MockQuestion[]> {
    await ensureReady()
    const rows = queryAll('SELECT data FROM mock_questions ORDER BY id')
    return rows
      .map((r) => safeParse<MockQuestion | null>(r.data, null))
      .filter((q): q is MockQuestion => Boolean(q))
  },

  // SQL practice sessions
  async loadSqlSessions(): Promise<SqlPracticeSession[]> {
    await ensureReady()
    const rows = queryAll('SELECT * FROM sql_practice_sessions ORDER BY id DESC')
    return rows.map((r: any) => ({
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
  },

  async addSqlSession(session: Omit<SqlPracticeSession, 'id' | 'created_at'>): Promise<void> {
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
    persist()
  },

  async deleteSqlSession(id: number): Promise<void> {
    await ensureReady()
    execute('DELETE FROM sql_practice_sessions WHERE id = ?', [id])
    persist()
  },

  async saveQuestions(questions: MockQuestion[]): Promise<void> {
    await ensureReady()
    const now = new Date().toISOString()
    for (const q of questions) {
      execute('INSERT OR REPLACE INTO mock_questions (id, data, updated_at) VALUES (?, ?, ?)', [
        q.id,
        JSON.stringify(q),
        now,
      ])
    }
    persist()
  },

  // Goals
  async loadGoals(): Promise<Goal[]> {
    await ensureReady()
    const rows = queryAll('SELECT * FROM goals ORDER BY CASE status WHEN "active" THEN 0 ELSE 1 END, id DESC')
    return rows.map((r: any) => ({
      id: Number(r.id),
      title: r.title,
      type: r.type as Goal['type'],
      category: r.category as Goal['category'],
      target_value: Number(r.target_value),
      current_value: Number(r.current_value),
      unit: r.unit,
      start_date: r.start_date,
      end_date: r.end_date,
      status: r.status as Goal['status'],
      questions: safeParse<MockQuestion[]>(r.questions, []),
      created_at: r.created_at,
    }))
  },

  async addGoal(goal: Omit<Goal, 'id' | 'created_at'>): Promise<number> {
    await ensureReady()
    execute(
      'INSERT INTO goals (title, type, category, target_value, current_value, unit, start_date, end_date, status, questions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        goal.title,
        goal.type,
        goal.category,
        goal.target_value,
        goal.current_value,
        goal.unit,
        goal.start_date,
        goal.end_date,
        goal.status,
        JSON.stringify(goal.questions ?? []),
      ]
    )
    persist()
    return lastInsertId()
  },

  async updateGoal(id: number, data: Partial<Goal>): Promise<void> {
    await ensureReady()
    const keys = Object.keys(data)
    if (keys.length === 0) return
    const setClause = keys.map((k) => `${k} = ?`).join(', ')
    const values = keys.map((k) => {
      const v = (data as any)[k]
      if (k === 'questions' && Array.isArray(v)) return JSON.stringify(v)
      return v
    })
    execute(`UPDATE goals SET ${setClause} WHERE id = ?`, [...values, id])
    persist()
  },

  async deleteGoal(id: number): Promise<void> {
    await ensureReady()
    execute('DELETE FROM goals WHERE id = ?', [id])
    persist()
  },

  // Pomodoro Logs
  async loadPomodoroLogs(): Promise<PomodoroLog[]> {
    await ensureReady()
    const rows = queryAll('SELECT * FROM pomodoro_logs ORDER BY id DESC')
    return rows.map((r: any) => ({
      id: Number(r.id),
      type: r.type as PomodoroLog['type'],
      duration_minutes: Number(r.duration_minutes),
      completed: Number(r.completed),
      started_at: r.started_at,
      ended_at: r.ended_at,
      created_at: r.created_at,
    }))
  },

  async addPomodoroLog(log: Omit<PomodoroLog, 'id' | 'created_at'>): Promise<void> {
    await ensureReady()
    execute('INSERT INTO pomodoro_logs (type, duration_minutes, completed, started_at, ended_at) VALUES (?, ?, ?, ?, ?)', [
      log.type,
      log.duration_minutes,
      log.completed,
      log.started_at,
      log.ended_at,
    ])
    persist()
  },
}

export const dbStore = {
  async get(key: string): Promise<any> {
    await ensureReady()
    const rows = queryAll('SELECT value FROM settings WHERE key = ?', [key])
    return rows.length > 0 ? rows[0].value : undefined
  },

  async set(key: string, value: any): Promise<void> {
    await ensureReady()
    execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)])
    persist()
  },

  async delete(key: string): Promise<void> {
    await ensureReady()
    execute('DELETE FROM settings WHERE key = ?', [key])
    persist()
  },
}

export async function resetAllData(): Promise<void> {
  await ensureReady()
  cancelPersist()
  db!.run('DELETE FROM activity_logs')
  db!.run('DELETE FROM profiles')
  db!.run('DELETE FROM notes')
  db!.run('DELETE FROM courses')
  db!.run('DELETE FROM daily_targets')
  db!.run('DELETE FROM roadmaps')
  db!.run('DELETE FROM ladders')
  db!.run('DELETE FROM mock_interviews')
  db!.run('DELETE FROM goals')
  db!.run('DELETE FROM pomodoro_logs')
  db!.run('DELETE FROM mock_questions')
  db!.run('DELETE FROM sql_practice_sessions')
  db!.run('DELETE FROM settings')

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

export { lastInsertId }
