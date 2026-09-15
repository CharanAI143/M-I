import { useCallback, useEffect, useRef, useState } from 'react'
import { dbApi } from '@/lib/db'
import { getToday } from '@/lib/utils'
import type { PomodoroLog } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { dateKey, formatClock, playBeep } from './planner-utils'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'

interface PomodoroCardProps {
  logs: PomodoroLog[]
  onComplete: () => void
}

export function PomodoroCard({ logs, onComplete }: PomodoroCardProps) {
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [focusMin, setFocusMin] = useState(25)
  const [breakMin, setBreakMin] = useState(5)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(25 * 60)
  const endRef = useRef(0)
  const doneRef = useRef(false)

  const durationSec = (mode === 'focus' ? focusMin : breakMin) * 60

  const handleComplete = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    const completedMode = mode
    const dur = completedMode === 'focus' ? focusMin : breakMin
    if (completedMode === 'focus') {
      const now = new Date().toISOString()
      dbApi
        .addPomodoroLog({ type: 'focus', duration_minutes: dur, completed: 1, started_at: now, ended_at: now })
        .then(onComplete)
        .catch(() => {})
    }
    playBeep()
    const nextMode: 'focus' | 'break' = completedMode === 'focus' ? 'break' : 'focus'
    setMode(nextMode)
    setRemaining((nextMode === 'focus' ? focusMin : breakMin) * 60)
    setRunning(false)
  }, [mode, focusMin, breakMin, onComplete])

  const completeRef = useRef(handleComplete)
  completeRef.current = handleComplete

  useEffect(() => {
    if (!running) return
    doneRef.current = false
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) completeRef.current()
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    if (remaining <= 0) {
      setRemaining(durationSec)
    }
    endRef.current = Date.now() + remaining * 1000
    doneRef.current = false
    setRunning(true)
  }

  const pause = () => {
    const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000))
    setRemaining(left)
    setRunning(false)
  }

  const reset = () => {
    setRunning(false)
    setRemaining(durationSec)
    doneRef.current = false
  }

  const pct = durationSec > 0 ? Math.min(1, remaining / durationSec) : 0
  const todaySessions = logs.filter(
    (l) => l.type === 'focus' && l.completed && dateKey(new Date(l.started_at)) === getToday()
  ).length
  const todayMinutes = logs
    .filter((l) => l.type === 'focus' && l.completed && dateKey(new Date(l.started_at)) === getToday())
    .reduce((sum, l) => sum + l.duration_minutes, 0)

  const R = 52
  const C = 2 * Math.PI * R

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-sm font-medium">Pomodoro Focus</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'focus' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => { if (!running) { setMode('focus'); setRemaining(focusMin * 60) } }}
            disabled={running}
          >
            Focus
          </Button>
          <Button
            size="sm"
            variant={mode === 'break' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => { if (!running) { setMode('break'); setRemaining(breakMin * 60) } }}
            disabled={running}
          >
            Break
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="relative">
            <svg width="132" height="132" viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" strokeWidth="8" className="stroke-secondary" />
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={mode === 'focus' ? 'stroke-yellow-500' : 'stroke-green-500'}
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold">{formatClock(remaining)}</span>
              <span className="text-xs text-muted-foreground">{mode === 'focus' ? 'Focus' : 'Break'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {!running ? (
              <Button size="sm" className="gap-1.5" onClick={start} disabled={remaining <= 0}>
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={pause}>
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            <Button size="icon" variant="outline" onClick={reset} title="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Focus length</Label>
              <Select value={String(focusMin)} onValueChange={(v) => { setFocusMin(Number(v)); if (!running && mode === 'focus') setRemaining(Number(v) * 60) }} disabled={running}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 25, 50].map((m) => (
                    <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Break length</Label>
              <Select value={String(breakMin)} onValueChange={(v) => { setBreakMin(Number(v)); if (!running && mode === 'break') setRemaining(Number(v) * 60) }} disabled={running}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15].map((m) => (
                    <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Completed today</span>
              <span className="font-semibold">{todaySessions} sessions</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground">Focus time today</span>
              <span className="font-semibold">{todayMinutes} min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}