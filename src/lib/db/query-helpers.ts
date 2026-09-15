// Small, dependency-free helpers for dynamic SQL statements. Column names come
// from Partial<T> field names, which map 1:1 to table columns, so they are
// trusted identifiers — never user input.

import type { Database } from 'sql.js'

// Builds the SET clause for a dynamic `UPDATE ... WHERE id = ?` statement.
export function buildUpdateSet(keys: readonly string[]): string {
  return keys.map((k) => `${k} = ?`).join(', ')
}

// Builds the column list + placeholder list for a dynamic INSERT using a known
// key set.
export function buildInsert(keys: readonly string[]): { cols: string; placeholders: string } {
  return {
    cols: keys.join(', '),
    placeholders: keys.map(() => '?').join(', '),
  }
}

// Enumerates all user tables (excluding SQLite internals). resetAllData uses
// this so a wipe stays complete even when new tables are added later.
export function listTables(db: Database): string[] {
  const rows = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  const names: string[] = []
  for (const row of rows[0]?.values ?? []) {
    if (typeof row[0] === 'string') names.push(row[0])
  }
  return names
}