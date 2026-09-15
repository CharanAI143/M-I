import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Contest } from '@/lib/contests'
import { ContestCountdown } from '@/components/ContestCountdown'
import AnimeQuotePoster from '@/components/AnimeQuotePoster'
import type { ContestPlatform } from './useContestAlarm'
import { AlarmClock, CalendarClock, Loader2, RefreshCw, Timer } from 'lucide-react'
import type { PosterCategory } from '@/lib/types'

interface ContestCardProps {
  hasLadders: boolean
  alarmOn: boolean
  toggleAlarm: () => void
  remindMinutes: number
  contestPlatform: ContestPlatform
  onPlatformChange: (p: ContestPlatform) => void
  contests: Record<ContestPlatform, Contest[]>
  contestsLoading: boolean
  contestsError: string
  onRefresh: () => void
  animePoster: boolean
  posterCategory?: PosterCategory
}

export function ContestCard({
  hasLadders,
  alarmOn,
  toggleAlarm,
  remindMinutes,
  contestPlatform,
  onPlatformChange,
  contests,
  contestsLoading,
  contestsError,
  onRefresh,
  animePoster,
  posterCategory,
}: ContestCardProps) {
  const platformContests = contests[contestPlatform]
  const upcoming = platformContests
    .filter((c) => c.startTime + c.duration > Date.now())
    .sort((a, b) => a.startTime - b.startTime)
  const next = upcoming[0]

  return (
    <Card className={`${hasLadders ? 'lg:col-span-1' : 'lg:col-span-2'} flex flex-col h-full min-h-0`}>
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
            onClick={() => onPlatformChange('codechef')}
          >
            CodeChef
          </Button>
          <Button
            size="sm"
            variant={contestPlatform === 'leetcode' ? 'default' : 'outline'}
            onClick={() => onPlatformChange('leetcode')}
          >
            LeetCode
          </Button>
          <Button
            size="sm"
            variant={contestPlatform === 'codeforces' ? 'default' : 'outline'}
            onClick={() => onPlatformChange('codeforces')}
          >
            Codeforces
          </Button>
          <Button size="icon" variant="ghost" onClick={onRefresh} disabled={contestsLoading} title="Refresh">
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
        {animePoster && (
          <div className="mt-auto flex-1 min-h-[200px]">
            <AnimeQuotePoster category={posterCategory} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}