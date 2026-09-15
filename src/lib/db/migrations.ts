// All schema bootstrap: CREATE TABLE IF NOT EXISTS statements, additive
// column migrations, and the built-in question-bank seed. Runs once per
// database initialization (see connection.ensureReady).

import type { Database } from 'sql.js'

import { DEFAULT_QUESTION_BANK } from '@/lib/interview'

// Returns true when the question bank was freshly seeded, so the caller knows
// the database changed and should be persisted.
export function runMigrations(db: Database): boolean {
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

  try {
    db.run(`ALTER TABLE ladders ADD COLUMN last_opened TEXT`)
  } catch {
    // column already exists
  }

  try {
    db.run(`ALTER TABLE mock_interviews ADD COLUMN results TEXT DEFAULT '[]'`)
  } catch {
    // column already exists
  }

  try {
    db.run(`ALTER TABLE goals ADD COLUMN questions TEXT DEFAULT '[]'`)
  } catch {
    // column already exists
  }

  // GitHub-specific columns on profiles
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

  try {
    db.run(`ALTER TABLE courses ADD COLUMN modules TEXT`)
  } catch {
    // column already exists
  }

  try {
    db.run(`ALTER TABLE courses ADD COLUMN started_at TEXT`)
  } catch {
    // column already exists
  }

  try {
    db.run(`ALTER TABLE courses ADD COLUMN last_active_at TEXT`)
  } catch {
    // column already exists
  }

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
    return true
  }

  return false
}