import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

let SQL: SqlJsStatic | null = null
let sqlPromise: Promise<SqlJsStatic> | null = null

function getSql(): Promise<SqlJsStatic> {
  if (SQL) return Promise.resolve(SQL)
  if (sqlPromise) return sqlPromise
  sqlPromise = initSqlJs({ locateFile: () => wasmUrl })
    .then((s) => {
      SQL = s
      return s
    })
    .catch((err) => {
      sqlPromise = null
      throw err
    })
  return sqlPromise
}

export interface SqlRow {
  [column: string]: string | number | null
}

function coerceValue(v: unknown): string | number | null {
  if (v === null || v === undefined) return null
  if (v instanceof Uint8Array) {
    try {
      return new TextDecoder().decode(v)
    } catch {
      return String(v)
    }
  }
  if (typeof v === 'number' || typeof v === 'string') return v
  return String(v)
}

function mapRows(columns: string[], values: unknown[][]): SqlRow[] {
  return values.map((vals) =>
    Object.fromEntries(columns.map((col, i) => [col, coerceValue(vals[i])]))
  )
}

export interface SqlQueryResult {
  columns: string[]
  rows: SqlRow[]
  elapsedMs: number
  error?: string
  changeCount?: number
  commandsRan?: number
}

export interface SqlCheckResult {
  passed: boolean
  mismatch?: string
}

function normalizeColumns(columns: string[]): string[] {
  return columns.map((c) => c.toLowerCase()).sort()
}

function normalizeRows(rows: SqlRow[]): string[] {
  return rows.map((row) =>
    Object.keys(row)
      .sort()
      .map((k) => {
        const v = row[k]
        if (v === null) return 'NULL'
        if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(8)
        return String(v)
      })
      .join('|')
  )
}

export async function runSqlQuery(schema: string, query: string): Promise<SqlQueryResult> {
  const S = await getSql()
  const db: Database = new S.Database()
  try {
    db.exec(schema)
    const t0 = performance.now()
    try {
      const results = db.exec(query)
      const elapsedMs = performance.now() - t0
      let changeCount = 0
      const commandsRan = results.length
      try {
        changeCount = db.getRowsModified()
      } catch {
        changeCount = 0
      }
      if (results.length === 0) {
        return { columns: [], rows: [], elapsedMs, changeCount, commandsRan }
      }
      const columns = results[0].columns
      const rows = mapRows(columns, results[0].values)
      return { columns, rows, elapsedMs, changeCount, commandsRan }
    } catch (e) {
      return {
        columns: [],
        rows: [],
        elapsedMs: performance.now() - t0,
        error: e instanceof Error ? e.message : String(e),
      }
    }
  } finally {
    db.close()
  }
}

// Compare a candidate query's output against the reference solution's output on
// the same freshly-seeded database. Column names and values are compared
// case-insensitively where possible; row order is ignored.
export async function checkSqlAnswer(
  schema: string,
  solution: string,
  candidate: string
): Promise<SqlCheckResult> {
  if (!candidate.trim()) return { passed: false, mismatch: 'No query submitted yet.' }
  const S = await getSql()
  const candDb: Database = new S.Database()
  const solDb: Database = new S.Database()
  try {
    candDb.exec(schema)
    solDb.exec(schema)
    let cand: { columns: string[]; rows: SqlRow[] }
    let sol: { columns: string[]; rows: SqlRow[] }
    try {
      const r = candDb.exec(candidate)
      if (r.length === 0) return { passed: false, mismatch: 'Your query did not return a result set.' }
      cand = {
        columns: r[0].columns,
        rows: mapRows(r[0].columns, r[0].values),
      }
    } catch (e) {
      return { passed: false, mismatch: `Query error: ${e instanceof Error ? e.message : String(e)}` }
    }
    try {
      const r = solDb.exec(solution)
      sol = {
        columns: r[0].columns,
        rows: mapRows(r[0].columns, r[0].values),
      }
    } catch {
      return { passed: false, mismatch: 'Reference solution failed to run.' }
    }

    const candCols = normalizeColumns(cand.columns)
    const solCols = normalizeColumns(sol.columns)
    if (candCols.join(',') !== solCols.join(',')) {
      return {
        passed: false,
        mismatch: `Column mismatch. Expected columns: ${solCols.join(', ')}`,
      }
    }
    const candRows = normalizeRows(cand.rows)
    const solRows = normalizeRows(sol.rows)
    if (candRows.length !== solRows.length) {
      return {
        passed: false,
        mismatch: `Row count mismatch. Expected ${solRows.length} rows, got ${candRows.length}.`,
      }
    }
    for (let i = 0; i < candRows.length; i++) {
      if (candRows[i] !== solRows[i]) {
        return { passed: false, mismatch: `Row ${i + 1} does not match the expected output.` }
      }
    }
    return { passed: true }
  } finally {
    candDb.close()
    solDb.close()
  }
}

export { initSqlJs }