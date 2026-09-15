import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ActivityHeatMapGrid } from '@/components/ActivityHeatMapGrid'
import TicTacToe from '@/components/games/TicTacToe'
import AnimeQuotePoster from '@/components/AnimeQuotePoster'
import type { ActivityLog, PosterCategory, SqlPracticeSession, SqlProblem } from '@/lib/types'
import { CheckCircle2, Database, History, Zap } from 'lucide-react'
import type { SqlConfig, SqlTodo } from './sql-utils'
import { SqlDailyQuestionsCard } from './SqlDailyQuestionsCard'
import { SqlRecentSessionsCard } from './SqlRecentSessionsCard'
import { QuickPracticeCard } from './QuickPracticeCard'
import { SqlSessionDetailDialog } from './SqlSessionDetailDialog'

interface SqlDashboardProps {
  sqlActivities: ActivityLog[]
  history: SqlPracticeSession[]
  streak: number
  totalSolved: number
  totalAttempted: number
  accuracy: number
  todos: SqlTodo[]
  todoDone: number
  todoTotal: number
  config: SqlConfig
  setConfig: (c: SqlConfig) => void
  detail: SqlPracticeSession | null
  setDetail: (s: SqlPracticeSession | null) => void
  showPoster: boolean
  posterCategory: PosterCategory | undefined
  onToggleTodo: (id: string) => void
  onRegenerateTodos: () => void
  onPracticeProblem: (p: SqlProblem) => void
  onStartSession: () => void
  onNewSession: () => void
  onRefreshHistory: () => void
  onDeleteSession: (id: number) => void
}

export function SqlDashboard({
  sqlActivities,
  history,
  streak,
  totalSolved,
  totalAttempted,
  accuracy,
  todos,
  todoDone,
  todoTotal,
  config,
  setConfig,
  detail,
  setDetail,
  showPoster,
  posterCategory,
  onToggleTodo,
  onRegenerateTodos,
  onPracticeProblem,
  onStartSession,
  onNewSession,
  onRefreshHistory,
  onDeleteSession,
}: SqlDashboardProps) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* SQL Streak */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SQL Practice Streak</CardTitle>
            <Database
              className="h-16 w-16 object-contain animate-float-fire text-emerald-400"
              style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.55)) drop-shadow(0 0 20px rgba(16,185,129,0.3))' }}
            />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-emerald-500">{streak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <Badge variant="secondary" className="mt-2">
              <Zap className="mr-1 h-3 w-3" />
              Keep querying!
            </Badge>
          </CardContent>
        </Card>

        {/* Questions Solved */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Questions Solved</CardTitle>
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{totalSolved}</span>
              <span className="text-sm text-muted-foreground">questions</span>
            </div>
            <Badge variant="secondary" className="mt-2">
              <History className="mr-1 h-3 w-3" />
              {history.length} session{history.length === 1 ? '' : 's'} completed
            </Badge>
          </CardContent>
        </Card>

        {/* Accuracy */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold ${accuracy >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {accuracy}%
              </span>
            </div>
            {totalAttempted > 0 ? (
              <>
                <Progress value={accuracy} className="mt-3 h-1.5" indicatorClassName="bg-primary" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {totalSolved}/{totalAttempted} queries passed
                </p>
              </>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">Complete a session to see accuracy.</p>
            )}
          </CardContent>
        </Card>

        {/* Daily SQL Questions */}
        <SqlDailyQuestionsCard
          todos={todos}
          todoDone={todoDone}
          todoTotal={todoTotal}
          onToggle={onToggleTodo}
          onRegenerate={onRegenerateTodos}
          onPractice={(p) => onPracticeProblem(p)}
        />
      </div>

      {/* Row 2: SQL Heat Map */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">SQL Practice Heat Map</CardTitle>
          <Badge variant="secondary" className="text-xs">Platform: SQL</Badge>
        </CardHeader>
        <CardContent>
          <ActivityHeatMapGrid activities={sqlActivities as ActivityLog[]} />
        </CardContent>
      </Card>

      {/* Row 3: Sessions + Right Column Stack (Quick Practice, Tic Tac Toe, Poster) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        {/* Recent sessions */}
        <SqlRecentSessionsCard
          history={history}
          onRefresh={onRefreshHistory}
          onNewSession={onNewSession}
          onViewDetail={setDetail}
          onDelete={onDeleteSession}
        />

        {/* Right column stack: Quick Practice + Tic Tac Toe + Poster */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
            {/* Quick practice */}
            <QuickPracticeCard config={config} setConfig={setConfig} onStart={onStartSession} />

            {/* Tic Tac Toe */}
            <div className="h-full">
              <TicTacToe />
            </div>
          </div>

          {/* Daily anime quote poster */}
          {showPoster && (
            <div className="flex-1 min-h-[200px]">
              <AnimeQuotePoster category={posterCategory} />
            </div>
          )}
        </div>
      </div>

      {/* Session detail dialog */}
      <SqlSessionDetailDialog detail={detail} onClose={() => setDetail(null)} />
    </div>
  )
}