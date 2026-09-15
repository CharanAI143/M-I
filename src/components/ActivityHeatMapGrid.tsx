import { formatDate, parseDateKey } from '@/lib/utils'

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)

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
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay())

  const startDate = new Date(currentWeekStart)
  startDate.setDate(startDate.getDate() - (heatWeeks - 1) * 7)

  const grid: number[][] = []
  for (let col = 0; col < heatWeeks; col++) {
    const week: number[] = []
    for (let row = 0; row < 7; row++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + col * 7 + row)
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
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    const weekStart = new Date(t)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const s = new Date(weekStart)
    s.setDate(s.getDate() - (heatWeeks - 1) * 7)
    return s
  })()

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 text-[10px] text-muted-foreground">
          {grid.map((week, colIdx) => {
            const sunDate = new Date(heatStartDate)
            sunDate.setDate(sunDate.getDate() + colIdx * 7)
            const month = sunDate.toLocaleString('en-US', { month: 'short' })
            let showLabel: boolean
            if (colIdx === 0) {
              showLabel = true
            } else {
              const prevDate = new Date(heatStartDate)
              prevDate.setDate(prevDate.getDate() + (colIdx - 1) * 7)
              showLabel = sunDate.getMonth() !== prevDate.getMonth()
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
                cellDate.setDate(cellDate.getDate() + colIdx * 7 + rowIdx)
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