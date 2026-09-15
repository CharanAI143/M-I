// Public data-access facade. Re-assembles the per-entity repositories into the
// same `dbApi` surface the rest of the app consumes, so the internal split into
// connection / migrations / repositories is invisible to callers.

import {
  ensureReady,
  resetAllData,
  runSql,
  schedulePersist,
  type Params,
} from './connection'
import { dbStore } from './key-value'
import { loadProfiles, updateProfile } from './repositories/profiles'
import { loadActivities, logActivity, pruneSyncActivities } from './repositories/activities'
import { ensureDailyTarget, updateDailyTarget } from './repositories/daily-targets'
import { deleteNote, loadNotes, saveNote } from './repositories/notes'
import { addRoadmap, deleteRoadmap, loadRoadmaps } from './repositories/roadmaps'
import { addLadder, deleteLadder, loadLadders, touchLadder } from './repositories/ladders'
import { addMockInterview, deleteMockInterview, loadMockInterviews } from './repositories/mock-interviews'
import { loadQuestions, saveQuestions } from './repositories/questions'
import { addSqlSession, deleteSqlSession, loadSqlSessions } from './repositories/sql-sessions'
import { addGoal, deleteGoal, loadGoals, updateGoal } from './repositories/goals'
import { addPomodoroLog, loadPomodoroLogs } from './repositories/pomodoro'

export const dbApi = {
  // Escape hatch for one-off maintenance statements (Dashboard's "reset
  // today's todos" cleanup uses it).
  async run(sql: string, params: Params = []): Promise<void> {
    await ensureReady()
    runSql(sql, params)
    schedulePersist()
  },

  // Profiles
  loadProfiles,
  updateProfile,

  // Activities
  loadActivities,
  logActivity,
  pruneSyncActivities,

  // Daily targets
  ensureDailyTarget,
  updateDailyTarget,

  // Notes
  loadNotes,
  saveNote,
  deleteNote,

  // Roadmaps
  loadRoadmaps,
  addRoadmap,
  deleteRoadmap,

  // Ladders
  loadLadders,
  addLadder,
  deleteLadder,
  touchLadder,

  // Mock interviews
  loadMockInterviews,
  addMockInterview,
  deleteMockInterview,

  // Company question bank
  loadQuestions,
  saveQuestions,

  // SQL practice sessions
  loadSqlSessions,
  addSqlSession,
  deleteSqlSession,

  // Goals
  loadGoals,
  addGoal,
  updateGoal,
  deleteGoal,

  // Pomodoro logs
  loadPomodoroLogs,
  addPomodoroLog,
}

export { dbStore }
export { resetAllData }