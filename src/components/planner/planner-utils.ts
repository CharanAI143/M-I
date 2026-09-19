// Shared pure helpers + constants for the Planner module and its sub-components.

import type { GoalCategory, GoalType } from '@/lib/types'

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Date keys follow the app's fixed UTC day convention (see getToday in
// @/lib/utils), never the machine's local calendar date.
export function dateKey(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function rangeForType(type: GoalType): { start: string; end: string } {
  const now = new Date()
  // Anchor the range to the current UTC day so the goal boundaries line up with
  // the same day the activity/streak counters use.
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (type === 'daily') {
    const k = dateKey(today)
    return { start: k, end: k }
  }
  if (type === 'weekly') {
    const start = new Date(today)
    start.setUTCDate(today.getUTCDate() - today.getUTCDay())
    const end = new Date(start)
    end.setUTCDate(start.getUTCDate() + 6)
    return { start: dateKey(start), end: dateKey(end) }
  }
  if (type === 'monthly') {
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0))
    return { start: dateKey(start), end: dateKey(end) }
  }
  const start = new Date(today)
  start.setUTCDate(today.getUTCDate() - 29)
  return { start: dateKey(start), end: dateKey(today) }
}

export function unitFor(category: GoalCategory, type: GoalType): string {
  if (type === 'streak') return 'days'
  if (category === 'problems') return 'problems'
  if (category === 'minutes') return 'minutes'
  if (category === 'questions') return 'questions'
  return 'topics'
}

export function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7)
    osc.start()
    osc.stop(ctx.currentTime + 0.7)
  } catch {
    // Audio not available — ignore
  }
}

export function getHeatColor(count: number): string {
  if (count >= 5) return 'bg-green-600 text-white'
  if (count >= 3) return 'bg-green-400 text-white'
  if (count >= 1) return 'bg-green-200 text-green-900'
  return ''
}