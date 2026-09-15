import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore, dbApi } from '@/store'
import { calculateStreak, getToday } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Timer, Zap, ExternalLink, RefreshCw, Loader2, CalendarClock, ListTodo, AlarmClock, ChevronDown, CheckCircle2, Circle } from 'lucide-react'
import fireIcon from '@/fire.png'
import { fetchCodeChefContests, fetchLeetCodeContests, fetchCodeForcesContests, type Contest } from '@/lib/contests'
import { pickDailyProblems, checkTodoCompletion } from '@/lib/problems'
import { cfSolveKey } from '@/lib/codeforces'
import { fetchCodeforcesSolved } from '@/lib/codeforces'
import { badgeIdForTag, saveTagCounts } from '@/lib/badges'
import { AnimalCard, LevelCard } from '@/components/ScoreCard'
import type { TodoItem, Ladder } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import { LaddersDialog } from '@/components/ladders/LaddersDialog'
import { List } from 'lucide-react'
import Wordle from '@/components/games/Wordle'
import AnimeQuotePoster from '@/components/AnimeQuotePoster'
import { ActivityHeatMapGrid } from '@/components/ActivityHeatMapGrid'
import { ContestCountdown } from '@/components/ContestCountdown'

export default function Dashboard() {
  const { activities, profiles, settings, clockWarning, setClockWarning } = useAppStore()
  const streak = calculateStreak(activities)

  const streakWeeks = Math.floor(streak / 7)
  const fireFloatDistance = `${Math.min(6 + streakWeeks * 2, 34)}px`
  const fireAnimationDuration = `${Math.max(1.2, 3 - streakWeeks * 0.1)}s`
  const originalFireFilter = 'saturate(1.15) brightness(1.1) drop-shadow(0 0 10px rgba(255,107,0,0.6)) drop-shadow(0 0 20px rgba(255,69,0,0.4))'
  const weekFireFilter = 'hue-rotate(250deg) saturate(1.3) brightness(1.15) drop-shadow(0 0 12px rgba(168,85,247,0.7)) drop-shadow(0 0 24px rgba(139,92,246,0.5))'
  const fireFilter = streak > 0 && streak % 7 === 0 ? weekFireFilter : originalFireFilter

  // ── Ladders (Codeforces) ───────────────────────────────────────
  const cfHandle = profiles.find((pr) => pr.platform === 'codeforces')?.username ?? ''
  const [ladders, setLadders] = useState<(Ladder & { solvedCount: number })[]>([])
  const [laddersOpen, setLaddersOpen] = useState(false)
  const [solvedKeys, setSolvedKeys] = useState<Set<string>>(new Set())

  const loadLadders = useCallback(async () => {
    if (!cfHandle) return
    try {
      const data = await dbApi.loadLadders(cfHandle)
      let keys = new Set<string>()
      try {
        const s = await fetchCodeforcesSolved(cfHandle)
        keys = s.keys
      } catch {}
      setSolvedKeys(keys)
      setLadders(data.map((l) => ({
        ...l,
        solvedCount: l.problems.filter((p) => keys.has(cfSolveKey(p.contestId, p.index))).length,
      })))
    } catch {}
  }, [cfHandle])

  useEffect(() => {
    loadLadders()
  }, [loadLadders])

  // ── Contest Countdown (live) ───────────────────────────────────
  const [contestPlatform, setContestPlatform] = useState<'codechef' | 'leetcode' | 'codeforces'>('codechef')
  const [contests, setContests] = useState<Record<'codechef' | 'leetcode' | 'codeforces', Contest[]>>({
    codechef: [],
    leetcode: [],
    codeforces: [],
  })
  const [contestsLoading, setContestsLoading] = useState(false)
  const [contestsError, setContestsError] = useState('')
  const [alarmOn, setAlarmOn] = useState(false)
  const [alarmSynced, setAlarmSynced] = useState(false)
  const notifiedContests = useRef<Map<string, boolean>>(new Map())

  const loadContests = useCallback(async () => {
    setContestsLoading(true)
    setContestsError('')
    try {
      const [codechef, leetcode, codeforces] = await Promise.all([
        fetchCodeChefContests(),
        fetchLeetCodeContests(),
        fetchCodeForcesContests(),
      ])
      setContests({ codechef, leetcode, codeforces })
    } catch (err: any) {
      setContestsError(err?.message || 'Failed to load contests')
    } finally {
      setContestsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContests()
  }, [loadContests])

  const platformContests = contests[contestPlatform]
  const upcoming = platformContests
    .filter((c) => c.startTime + c.duration > Date.now())
    .sort((a, b) => a.startTime - b.startTime)
  const next = upcoming[0]

  // ── Contest Alarm (notify at user-chosen lead time) ──────────
  // Inside Electron the alarm runs in the main process so notifications keep
  // firing even when the window is closed (the app stays in the tray). The
  // local Notification scheduling below is only a browser-only fallback.
  const backgroundAlarm = typeof window.alarm !== 'undefined'

  const toggleAlarm = async () => {
    if (backgroundAlarm) {
      setAlarmOn((on) => !on)
      return
    }
    if (!alarmOn) {
      // Request permission when turning the alarm on (browser fallback)
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        try {
          await Notification.requestPermission()
        } catch {}
      }
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        setContestsError('Notification permission required to enable alarm.')
        return
      }
      notifiedContests.current = new Map()
      setAlarmOn(true)
    } else {
      setAlarmOn(false)
      notifiedContests.current.clear()
    }
  }

  const remindMinutes = settings?.contestRemindMinutes ?? 15
  const remindMs = remindMinutes * 60 * 1000

  // Push the alarm config to the background scheduler whenever it changes.
  // Gated on `alarmSynced` so the initial mount doesn't stamp a stale default
  // (off/15/codechef) over the config the main process restored on startup.
  useEffect(() => {
    if (!backgroundAlarm || !alarmSynced) return
    window.alarm?.set({ enabled: alarmOn, remindMinutes, platform: contestPlatform })
  }, [alarmOn, remindMinutes, contestPlatform, backgroundAlarm, alarmSynced])

  // Restore the alarm state from the main process (survives window close) and
  // stay in sync when it is toggled from the tray menu.
  useEffect(() => {
    if (!backgroundAlarm) return
    const syncFromMain = async () => {
      try {
        const config = await window.alarm?.get()
        if (config) {
          setAlarmOn(config.enabled)
          setContestPlatform(config.platform)
          useAppStore.getState().updateSettings({ contestRemindMinutes: config.remindMinutes })
        }
      } catch {}
      finally {
        setAlarmSynced(true)
      }
    }
    syncFromMain()
    const unsubscribe = window.alarm?.onChanged((config) => {
      if (config) {
        setAlarmOn(config.enabled)
        setContestPlatform(config.platform)
        useAppStore.getState().updateSettings({ contestRemindMinutes: config.remindMinutes })
      }
    })
    return unsubscribe
  }, [backgroundAlarm])

  const prevRemindMinutes = useRef(remindMinutes)
  useEffect(() => {
    if (remindMinutes !== prevRemindMinutes.current) {
      prevRemindMinutes.current = remindMinutes
      notifiedContests.current.clear()
    }
  }, [remindMinutes])

  // Schedule per-contest reminder + "live now" notifications at the configured
  // lead time (browser-only fallback; the Electron main process handles this
  // in the background).
  useEffect(() => {
    if (!alarmOn || backgroundAlarm) return

    const platformContests = contests[contestPlatform]
    const upcoming = platformContests
      .filter((c) => c.startTime + c.duration > Date.now())
      .sort((a, b) => a.startTime - b.startTime)

    const timers: ReturnType<typeof setTimeout>[] = []
    const nowMs = Date.now()

    const maybeNotify = (id: string, title: string, body: string) => {
      if (notifiedContests.current.has(id)) return
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      try {
        new Notification(title, { body, icon: undefined })
        notifiedContests.current.set(id, true)
      } catch {}
    }

    for (const contest of upcoming) {
      const id = `${contest.platform}-${contest.title}-${contest.startTime}`
      const remindAt = contest.startTime - remindMs

      // Reminder at the configured lead time.
      if (remindAt > nowMs) {
        timers.push(
          setTimeout(
            () =>
              maybeNotify(
                id,
                'Contest Reminder',
                `${contest.title} on ${contest.platform} starts in ${remindMinutes} minute${remindMinutes === 1 ? '' : 's'}.`
              ),
            remindAt - nowMs
          )
        )
      } else if (contest.startTime > nowMs) {
        // Lead time already passed but the contest hasn't started — notify now
        // with the real remaining time.
        const minsLeft = Math.max(1, Math.ceil((contest.startTime - nowMs) / 60000))
        maybeNotify(
          id,
          'Contest Reminder',
          `${contest.title} on ${contest.platform} starts in ${minsLeft} minute${minsLeft === 1 ? '' : 's'}.`
        )
      }

      // "Live now" notification at start time.
      if (contest.startTime > nowMs) {
        timers.push(
          setTimeout(
            () =>
              maybeNotify(
                `live:${id}`,
                'Contest Started',
                `${contest.title} on ${contest.platform} is live now!`
              ),
            contest.startTime - nowMs
          )
        )
      }
    }

    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarmOn, contests, contestPlatform, remindMs])

  // ── Todo Questions ────────────────────────────────────────────
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

  const todoDone = todos.filter((t) => t.done).length
  const todoTotal = todos.length

  const [picking, setPicking] = useState(false)
  const [pickError, setPickError] = useState('')

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

  // ── Heat Map ───────────────────────────────────────────────────
  return (
    <div className="space-y-6 h-full flex flex-col">
      {clockWarning && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlarmClock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-200/90">{clockWarning}</p>
          </div>
          <Button variant="ghost" size="sm" className="-m-1 text-amber-300 hover:bg-amber-500/10 hover:text-amber-100" onClick={() => setClockWarning(null)} aria-label="Dismiss warning">
            ✕
          </Button>
        </div>
      )}
      {/* Row 1: Streak + Animal + Badges + Todos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Streak Tracker */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <img
              src={fireIcon}
              alt="🔥"
              className="h-16 w-16 object-contain animate-float-fire"
              style={{
                ['--fire-float-distance' as string]: fireFloatDistance,
                animationDuration: fireAnimationDuration,
                filter: fireFilter,
              }}
            />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-orange-500">{streak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <Badge variant="secondary" className="mt-2">
              <Zap className="mr-1 h-3 w-3" />
              Keep it going!
            </Badge>
          </CardContent>
        </Card>

        {/* Animal identity (dominant topic badge) */}
        <AnimalCard />

        {/* Coder level */}
        <LevelCard />

        {/* Daily Todos */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Todo Questions</CardTitle>
            <div className="flex items-center gap-1">
              {todoTotal > 0 && todoDone === todoTotal && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePickProblems()}
                  disabled={picking}
                  title="All done! Pick a fresh set to keep your streak going."
                >
                  {picking ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Zap className="h-3.5 w-3.5 mr-1" />}
                  {isBeginner ? "Pick 5" : "Pick 6"}
                </Button>
              )}
              <ListTodo className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-3">
            {pickError && <p className="text-center text-xs text-red-400">{pickError}</p>}

            {/* List */}
            {todoTotal === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-4">
                Generating today's questions…
              </p>
            ) : (
              <div className="space-y-1 max-h-[160px] overflow-y-auto">
                {todos.map((t) => (
                  <div key={t.id} className="rounded-md border">
                    <div className="flex items-center px-2.5 py-1.5">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (t.url) window.open(t.url, '_blank', 'noopener,noreferrer') }}
                        className={`text-sm truncate hover:underline ${t.done ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {t.text}
                      </a>
                    </div>
                    {!t.done && t.tags && t.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 px-2.5 pb-1.5">
                        <span className="text-[10px] text-muted-foreground">Learn:</span>
                        {t.tags.map((tag) => {
                          const href = t.platform === 'codeforces'
                            ? `https://codeforces.com/problemset?tags=${encodeURIComponent(tag)}`
                            : `https://leetcode.com/tag/${tag}/`
                          return (
                            <a
                              key={tag}
                              href="#"
                              onClick={(e) => { e.preventDefault(); window.open(href, '_blank', 'noopener,noreferrer') }}
                              className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-foreground/80 hover:bg-secondary/70 hover:underline"
                            >
                              {tag}
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {todoTotal > 0 && (
              <div className="text-center text-xs text-muted-foreground">
                {todoDone}/{todoTotal} completed
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Heat Map */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Activity Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatMapGrid activities={activities} />
        </CardContent>
      </Card>

      {/* Row 3: Ladders + Contest Countdown + Wordle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Ladders (Codeforces) */}
        {cfHandle && (
          <Card className="lg:col-span-1 flex flex-col h-full min-h-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Your Ladders</CardTitle>
              <Button size="icon" variant="ghost" onClick={() => setLaddersOpen(true)} title="Manage ladders">
                <List className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {ladders.length === 0 ? (
                <p className="text-center py-4 text-sm text-muted-foreground">
                  No ladders yet. Add one from Profiles.
                </p>
              ) : (
                <div className="space-y-2">
                    {ladders.map((l) => {
                      const pct = l.problems.length ? Math.round((l.solvedCount / l.problems.length) * 100) : 0
                      return (
                        <div key={l.id} className="rounded-lg border p-2.5 space-y-2">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{l.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {l.solvedCount} / {l.problems.length} solved
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 w-9 text-right">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-1.5" indicatorClassName="bg-primary" />
                          <div className="rounded-md border">
                            <div className="p-1 max-h-[400px] overflow-y-auto overflow-x-hidden">
                              {l.problems.map((p) => {
                                const isSolved = solvedKeys.has(cfSolveKey(p.contestId, p.index))
                                return (
                                  <a
                                    key={`${p.contestId}${p.index}`}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); window.open(p.url, '_blank', 'noopener,noreferrer') }}
                                    className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                                  >
                                    {isSolved ? (
                                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                                    ) : (
                                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    )}
                                    <span className="truncate flex-1">{p.name}</span>
                                    <span className="shrink-0 text-xs text-muted-foreground">{p.rating}</span>
                                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                                  </a>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contest Countdown (Live) */}
        <Card className={`${cfHandle ? 'lg:col-span-1' : 'lg:col-span-2'} flex flex-col h-full min-h-0`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contest Countdown</CardTitle>
            <button
              type="button"
              onClick={toggleAlarm}
              title={
                alarmOn
                  ? `Alarm On: Notify ${remindMinutes} min before contests. Click to disable.`
                  : `Alarm Off: Click to enable notifications ${remindMinutes} min before contests.`
              }
              className={`transition-colors ${alarmOn ? 'text-red-500 animate-pulse' : 'text-amber-500 hover:text-red-500'}`}
            >
              {alarmOn ? <AlarmClock className="h-5 w-5" /> : <Timer className="h-5 w-5" />}
            </button>
          </CardHeader>
          <CardContent className="flex flex-col min-h-0 pb-6 pt-0 space-y-4">
            {alarmOn && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-500">
                <AlarmClock className="h-3.5 w-3.5" />
                Alarm On - Remind {remindMinutes} minute{remindMinutes === 1 ? '' : 's'} before start
              </div>
            )}
            {/* Platform toggle */}
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant={contestPlatform === 'codechef' ? 'default' : 'outline'}
                onClick={() => setContestPlatform('codechef')}
              >
                CodeChef
              </Button>
              <Button
                size="sm"
                variant={contestPlatform === 'leetcode' ? 'default' : 'outline'}
                onClick={() => setContestPlatform('leetcode')}
              >
                LeetCode
              </Button>
              <Button
                size="sm"
                variant={contestPlatform === 'codeforces' ? 'default' : 'outline'}
                onClick={() => setContestPlatform('codeforces')}
              >
                Codeforces
              </Button>
              <Button size="icon" variant="ghost" onClick={loadContests} disabled={contestsLoading} title="Refresh">
                {contestsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>

            {contestsLoading && upcoming.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading contests...
              </div>
            ) : contestsError ? (
              <div className="text-center py-6 text-sm text-red-400">{contestsError}</div>
            ) : next ? (
              <div className="space-y-3">
                {/* Countdown to selected contest */}
                <ContestCountdown contest={next} />

                {/* Upcoming list */}
                <div className="space-y-1">
                  {upcoming.slice(1, 5).map((c) => (
                    <div
                      key={c.url}
                      className="flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs"
                    >
                      <span className="truncate pr-2">{c.title}</span>
                      <span className="text-muted-foreground flex-shrink-0">
                        {new Date(c.startTime).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {upcoming.length <= 1 && (
                    <p className="text-center text-xs text-muted-foreground pt-1">
                      No more upcoming contests.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <CalendarClock className="mx-auto mb-2 h-8 w-8 opacity-40" />
                No upcoming contests right now.
              </div>
            )}

            {/* Daily anime quote poster filling the leftover space */}
            {settings?.animePoster && (
              <div className="mt-auto flex-1 min-h-[200px]">
                <AnimeQuotePoster category={settings?.posterCategory} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wordle */}
        <div className="lg:col-span-1 h-full">
          <Wordle />
        </div>
      </div>

      {cfHandle && (
        <LaddersDialog open={laddersOpen} onOpenChange={setLaddersOpen} handle={cfHandle} />
      )}
    </div>
  )
}
