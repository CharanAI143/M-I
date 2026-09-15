import { DEFAULT_SQL_PROBLEMS } from '@/lib/sqlProblems'
import type { SqlDifficulty, SqlProblem } from '@/lib/types'

export interface SqlTodo {
  id: string
  done: boolean
}

export interface SqlConfig {
  title: string
  difficulty: SqlDifficulty | 'Mixed'
  topic: string
  count: number
  duration: number
}

export const problemById = (id: string): SqlProblem | undefined =>
  DEFAULT_SQL_PROBLEMS.find((p) => p.id === id)