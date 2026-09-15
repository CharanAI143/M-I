import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store'
import { dbApi } from '@/lib/db'
import { getToday } from '@/lib/utils'
import { pickDailyProblems, checkTodoCompletion } from '@/lib/problems'
import { badgeIdForTag, saveTagCounts } from '@/lib/badges'
import type { TodoItem, Profile } from '@/lib/types'

export function useTodos(profiles: Profile[]) {
  const todayKey = `mi-tracker-todos-${getToday()}`
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(todayKey) || '[]')
      // Migrate old todos without URLs: keep only items that have a url
      return stored.filter((t: TodoItem) => t.url)
    } catch {
      return []
    }
  })

  const persistTodos = useCallback((items: TodoItem[]) => {
    localStorage.setItem(todayKey, JSON.stringify(items))
  }, [todayKey])

  const logTodoCompletionActivity = useCallback(async (doneCount: number) => {
    try {
      await dbApi.logActivity('todo', doneCount, 0, 0, 0)
      const activities = await dbApi.loadActivities()
      useAppStore.getState().setActivities(activities)
    } catch (err) {
      console.error('Failed to log todo completion activity:', err)
    }
  }, [])

  const streakActivityLoggedRef = useRef<string | null>(null)

  // Retroactively log yesterday's activity on mount so the streak survives
  // across app restarts / rebuilds — exactly like LeetCode's "solve any day"
  // behaviour even when you weren't on the site that day.
  useEffect(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const y = yesterday.getFullYear()
    const m = String(yesterday.getMonth() + 1).padStart(2, '0')
    const d = String(yesterday.getDate()).padStart(2, '0')
    const yesterdayKey = `mi-tracker-todos-${y}-${m}-${d}`
    const yesterdayDate = `${y}-${m}-${d}`

    try {
      const stored: TodoItem[] = JSON.parse(localStorage.getItem(yesterdayKey) || '[]')
      const doneCount = stored.filter((t) => t.done).length
      if (doneCount >= 1) {
        // Log against yesterday's date, not today — otherwise this invents a
        // bogus "today" row that inflates the streak and gets torn down by the
        // self-heal effect on remount. Check the DB directly: the store may
        // still be empty while App.tsx loads data asynchronously.
        dbApi.loadActivities().then(async (activities) => {
          const alreadyLogged = activities.some(
            (a) => a.date === yesterdayDate && a.platform === 'todo'
          )
          if (alreadyLogged) return
          await dbApi.logActivity('todo', doneCount, 0, 0, 0, yesterdayDate, { ignoreClockGuard: true })
          const updated = await dbApi.loadActivities()
          useAppStore.getState().setActivities(updated)
        })
      }
    } catch {
      // ignore — optional retroactive log
    }
  }, [])

  // Self-heal: a 'todo' activity row for today with zero done todos today is
  // bogus — it was previously created when an already-solved problem leaked
  // into today's list and got auto-checked from old history. Drop it so the
  // streak doesn't count a day the user didn't actually solve.
  useEffect(() => {
    const doneCount = todos.filter((t) => t.done).length
    if (doneCount !== 0) return
    const hasTodayRow = useAppStore
      .getState()
      .activities.some((a) => a.date === getToday() && a.platform === 'todo')
    if (!hasTodayRow) return
    dbApi.run("DELETE FROM activity_logs WHERE date = ? AND platform = 'todo'", [getToday()]).then(async () => {
      const activities = await dbApi.loadActivities()
      useAppStore.getState().setActivities(activities)
    })
  }, [todos])

  // Beginner detection: total solved < 100 across all platforms
  const isBeginner = profiles.reduce((sum, p) => sum + (p.total_solved || 0), 0) < 100

  // Get exclude IDs from previous incomplete todos
  const getPreviousIncompleteIds = useCallback((): string[] => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const y = yesterday.getFullYear()
    const m = String(yesterday.getMonth() + 1).padStart(2, '0')
    const d = String(yesterday.getDate()).padStart(2, '0')
    const yesterdayKey = `mi-tracker-todos-${y}-${m}-${d}`
    try {
      const stored = JSON.parse(localStorage.getItem(yesterdayKey) || '[]')
      return stored.filter((t: TodoItem) => !t.done && t.url).map((t: TodoItem) => t.id)
    } catch {
      return []
    }
  }, [])

  const [picking, setPicking] = useState(false)
  const [pickError, setPickError] = useState('')

  const handlePickProblems = useCallback(async (excludeIds: string[] = []) => {
    setPicking(true)
    setPickError('')
    try {
      const picked = await pickDailyProblems(excludeIds, isBeginner)
      const updated = picked.map((p) => ({
        id: p.id,
        text: p.text,
        done: false,
        url: p.url,
        platform: p.id.startsWith('cf-') ? 'codeforces' as const : 'leetcode' as const,
        tags: p.tags,
      }))
      setTodos(updated)
      persistTodos(updated)
    } catch (err: any) {
      setPickError(err?.message || 'Failed to load problems')
    } finally {
      setPicking(false)
    }
  }, [isBeginner, persistTodos])

  // Auto-generate todos once per app run. Dependent on `profiles` so we
  // generate only after App.tsx finishes loading profiles (correct beginner
  // detection). `profiles` is replaced with a fresh array after load (even when
  // empty), so this reliably fires once profiles are available.
  const todosGeneratedRef = useRef(false)

  useEffect(() => {
    if (todosGeneratedRef.current) return
    if (todos.length > 0) {
      todosGeneratedRef.current = true
      return
    }
    handlePickProblems(getPreviousIncompleteIds())
    todosGeneratedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles])

  // Auto-check solve status every 60 seconds
  useEffect(() => {
    if (todos.length === 0) return

    const check = async () => {
      const newlySolved = await checkTodoCompletion(todos, profiles)
      if (newlySolved.size > 0) {
        setTodos((prev) => {
          const updated = prev.map((t) =>
            newlySolved.has(t.id) ? { ...t, done: true } : t
          )
          persistTodos(updated)

          // Tally topic tags for badges from the todos we just detected as solved.
          const solvedTodos = prev.filter((t) => newlySolved.has(t.id))
          if (solvedTodos.length > 0) {
            const counts = { ...useAppStore.getState().tagCounts }
            solvedTodos.forEach((t) => {
              ;(t.tags ?? []).forEach((tag) => {
                const id = badgeIdForTag(tag)
                if (id) counts[id] = (counts[id] ?? 0) + 1
              })
            })
            saveTagCounts(counts)
            useAppStore.getState().setTagCounts(counts)
          }

          const newDone = updated.filter((t) => t.done).length
          // A day counts toward the streak when 3 or more problems are solved.
          // Log the day's activity with the actual count; the ref stores the date
          // so it resets at midnight.
          const statsToday = getToday()
          if (newDone >= 1 && streakActivityLoggedRef.current !== statsToday) {
            streakActivityLoggedRef.current = statsToday
            logTodoCompletionActivity(newDone)
          }
          return updated
        })
      }
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos.length, profiles])

  const todoDone = todos.filter((t) => t.done).length
  const todoTotal = todos.length

  return {
    todos,
    setTodos,
    picking,
    pickError,
    handlePickProblems,
    todoDone,
    todoTotal,
    isBeginner,
  }
}