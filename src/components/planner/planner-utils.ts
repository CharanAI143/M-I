// Shared pure helpers + constants for the Planner module and its sub-components.

import type { GoalCategory, GoalType } from '@/lib/types'

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
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
  if (type === 'daily') {
    const k = dateKey(now)
    return { start: k, end: k }
  }
  if (type === 'weekly') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start: dateKey(start), end: dateKey(end) }
  }
  if (type === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { start: dateKey(start), end: dateKey(end) }
  }
  const start = new Date(now)
  start.setDate(now.getDate() - 29)
  return { start: dateKey(start), end: dateKey(now) }
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