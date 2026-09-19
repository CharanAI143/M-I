import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Check, ChevronLeft, ChevronRight, ListChecks, Timer } from 'lucide-react'
import { WEEKDAYS, dateKey, getHeatColor } from './planner-utils'

interface CalendarCardProps {
  solvedByDate: Map<string, number>
  focusMinutesByDate: Map<string, number>
  dailyTarget: { easy_target: number; easy_done: number; medium_target: number; medium_done: number; hard_target: number; hard_done: number } | null
  today: string
  todaySolved: number
  activities: Array<{ date: string; problems_solved: number }>
}

export function CalendarCard({
  solvedByDate,
  focusMinutesByDate,
  dailyTarget,
  today,
  todaySolved,
  activities,
}: CalendarCardProps) {
  // The grid is rendered in the app's fixed UTC day convention (matching the
  // `today`/`todayKey` date keys and the UTC dateKey helper), so the "today"
  // ring always lands on the same day the streak/activity counters use.
  const now = new Date()
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())
  const [selected, setSelected] = useState<string>(today)

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(year, month, 1))
    const startOffset = first.getUTCDay()
    const start = new Date(first)
    start.setUTCDate(first.getUTCDate() - startOffset)
    const items: Array<{ date: string; day: number; inMonth: boolean }> = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setUTCDate(start.getUTCDate() + i)
      items.push({
        date: dateKey(d),
        day: d.getUTCDate(),
        inMonth: d.getUTCMonth() === month,
      })
    }
    return items
  }, [year, month])

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1)
  }
  const goToday = () => {
    setYear(now.getUTCFullYear())
    setMonth(now.getUTCMonth())
    setSelected(today)
  }

  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const selSolved = solvedByDate.get(selected) ?? 0
  const selMinutes = focusMinutesByDate.get(selected) ?? 0
  const selDate = new Date(selected)
  const selStreakCount = activities.filter((a) => a.date === selected).reduce((s, a) => s + a.problems_solved, 0)
  const isTodayCell = (d: string) => d === today

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-sm font-medium">Study Calendar</CardTitle>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-sm font-medium" onClick={goToday}>
            {monthLabel}
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
          {cells.map((c) => {
            const solved = solvedByDate.get(c.date) ?? 0
            const minutes = focusMinutesByDate.get(c.date) ?? 0
            const isSelected = selected === c.date
            const selectedToday = isTodayCell(c.date)
            return (
              <button
                key={c.date}
                onClick={() => setSelected(c.date)}
                className={`relative aspect-square rounded-md border p-1 text-left transition-colors ${getHeatColor(solved)} ${
                  !c.inMonth ? 'opacity-40' : ''
                } ${selectedToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''} ${
                  isSelected && !selectedToday ? 'ring-1 ring-primary' : ''
                } hover:opacity-90`}
                title={`${c.date}: ${solved} solved, ${minutes} focus min`}
              >
                <span className="text-xs font-medium">{c.day}</span>
                {solved > 0 && (
                  <span className="absolute bottom-0.5 right-1 text-[10px] font-semibold">{solved}</span>
                )}
                {minutes > 0 && (
                  <span
                    className="absolute bottom-0.5 left-1 h-1 w-1 rounded-full bg-blue-400"
                    title={`${minutes} focus min`}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground capitalize">{selDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            <p className="mt-1 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-green-500" />
              <span className="font-semibold">{selSolved} solved</span>
            </p>
            <p className="mt-1 flex items-center gap-2">
              <Timer className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{selMinutes} focus min</span>
            </p>
          </div>
          {selected === today && dailyTarget && (
            <div className="sm:border-l sm:border-border sm:pl-3">
              <p className="text-xs text-muted-foreground">Daily target</p>
              <p className="mt-1 text-sm">
                <span className="text-green-500">{dailyTarget.easy_done}</span>
                <span className="text-muted-foreground">/{dailyTarget.easy_target} Easy</span>
              </p>
              <p className="mt-0.5 text-sm">
                <span className="text-yellow-500">{dailyTarget.medium_done}</span>
                <span className="text-muted-foreground">/{dailyTarget.medium_target} Medium</span>
              </p>
              <p className="mt-0.5 text-sm">
                <span className="text-red-500">{dailyTarget.hard_done}</span>
                <span className="text-muted-foreground">/{dailyTarget.hard_target} Hard</span>
              </p>
            </div>
          )}
          {selected === today && (
            <div className="sm:border-l sm:border-border sm:pl-3">
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="mt-1 flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {todaySolved >= 3 ? 'Daily streak goal met' : `${3 - todaySolved} more to reach the daily goal`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{selStreakCount} total submissions logged</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}