import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Flame, ListChecks, Timer } from 'lucide-react'

interface PlannerStatsProps {
  todaySolved: number
  weekSolved: number
  todayMinutes: number
  streak: number
}

export function PlannerStats({ todaySolved, weekSolved, todayMinutes, streak }: PlannerStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-xs text-muted-foreground">Solved today</p>
            <p className="text-3xl font-bold">{todaySolved}</p>
          </div>
          <ListChecks className="h-8 w-8 text-green-500 opacity-60" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-xs text-muted-foreground">Solved this week</p>
            <p className="text-3xl font-bold">{weekSolved}</p>
          </div>
          <Calendar className="h-8 w-8 text-blue-500 opacity-60" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-xs text-muted-foreground">Focus minutes today</p>
            <p className="text-3xl font-bold">{todayMinutes}</p>
          </div>
          <Timer className="h-8 w-8 text-yellow-500 opacity-60" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-xs text-muted-foreground">Current streak</p>
            <p className="text-3xl font-bold text-orange-500">{streak}</p>
          </div>
          <Flame className="h-8 w-8 text-orange-500 opacity-60" />
        </CardContent>
      </Card>
    </div>
  )
}