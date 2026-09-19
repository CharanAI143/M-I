import { formatDate, parseDateKey } from '@/lib/utils'

function formatDateKey(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// The app's day convention is fixed to UTC (see getToday in @/lib/utils), so
// "today" is never the machine's local date. This also keeps every cell in the
// grid aligned with the same day that activity rows are keyed by.
function startOfUtcDay(time = Date.now()): Date {
  const now = new Date(time)
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function getHeatMapColor(count: number): string {
  if (count === 0) return 'bg-secondary'
  if (count === 1) return 'bg-green-200'
  if (count === 2) return 'bg-green-400'
  if (count === 3) return 'bg-green-600'
  return 'bg-green-800'
}

const heatWeeks = 52

export function ActivityHeatMapGrid({
  activities,
}: {
  activities: Array<{ date: string; problems_solved?: number; created_at?: string }>
}) {
  const today = startOfUtcDay()

  const submissionsByDate: Record<string, number> = {}
  activities.forEach((a) => {
    if (a.problems_solved) {
      const dateKey = formatDateKey(parseDateKey(a.date || a.created_at || ''))
      submissionsByDate[dateKey] = (submissionsByDate[dateKey] || 0) + a.problems_solved
    }
  })

  // Sunday of the current week, so today's week is the rightmost column and
  // its future days render as empty cells.
  const currentWeekStart = new Date(today)
  currentWeekStart.setUTCDate(currentWeekStart.getUTCDate() - currentWeekStart.getUTCDay())

  const startDate = new Date(currentWeekStart)
  startDate.setUTCDate(startDate.getUTCDate() - (heatWeeks - 1) * 7)

  const grid: number[][] = []
  for (let col = 0; col < heatWeeks; col++) {
    const week: number[] = []
    for (let row = 0; row < 7; row++) {
      const d = new Date(startDate)
      d.setUTCDate(d.getUTCDate() + col * 7 + row)
      if (d > today) {
        week.push(-1)
      } else {
        const key = formatDateKey(d)
        week.push(submissionsByDate[key] || 0)
      }
    }
    grid.push(week)
  }

  // First date rendered by the heatmap (column 0, row 0), used for tooltips so
  // the shown date always matches the actual cell.
  const heatStartDate = (() => {
    const t = startOfUtcDay()
    const weekStart = new Date(t)
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay())
    const s = new Date(weekStart)
    s.setUTCDate(s.getUTCDate() - (heatWeeks - 1) * 7)
    return s
  })()

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 text-[10px] text-muted-foreground">
          {grid.map((week, colIdx) => {
            const sunDate = new Date(heatStartDate)
            sunDate.setUTCDate(sunDate.getUTCDate() + colIdx * 7)
            const month = sunDate.toLocaleString('en-US', { month: 'short' })
            let showLabel: boolean
            if (colIdx === 0) {
              showLabel = true
            } else {
              const prevDate = new Date(heatStartDate)
              prevDate.setUTCDate(prevDate.getUTCDate() + (colIdx - 1) * 7)
              showLabel = sunDate.getUTCMonth() !== prevDate.getUTCMonth()
            }
            return (
              <div key={colIdx} className="flex-1 truncate text-center">
                {showLabel ? month : ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-[3px]">
          {grid.map((week, colIdx) => (
            <div key={colIdx} className="flex flex-1 flex-col gap-[3px]">
              {week.map((count, rowIdx) => {
                const cellDate = new Date(heatStartDate)
                cellDate.setUTCDate(cellDate.getUTCDate() + colIdx * 7 + rowIdx)
                return (
                  <div
                    key={rowIdx}
                    className={`aspect-square w-full rounded-sm ${getHeatMapColor(count)} ${
                      count === -1 ? 'opacity-0' : ''
                    }`}
                    title={count === -1 ? '' : `${formatDate(cellDate)}: ${count} submissions`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        {['bg-secondary', 'bg-green-200', 'bg-green-400', 'bg-green-600', 'bg-green-800'].map((c) => (
          <div key={c} className={`h-3 w-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}