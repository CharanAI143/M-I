import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SQL_COUNTS, SQL_DURATIONS, SQL_TOPICS } from '@/lib/sqlProblems'
import type { SqlDifficulty } from '@/lib/types'
import { Play, PlayCircle } from 'lucide-react'
import type { SqlConfig } from './sql-utils'

interface QuickPracticeCardProps {
  config: SqlConfig
  setConfig: (c: SqlConfig) => void
  onStart: () => void
}

export function QuickPracticeCard({ config, setConfig, onStart }: QuickPracticeCardProps) {
  return (
    <Card className="flex flex-col h-full min-h-0">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm font-medium">Quick Practice</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Jump straight into a timed query session.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Difficulty</Label>
          <Select
            value={config.difficulty}
            onValueChange={(v) => setConfig({ ...config, difficulty: v as SqlDifficulty | 'Mixed' })}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Mixed', 'Easy', 'Medium', 'Hard'].map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Topic</Label>
          <Select value={config.topic} onValueChange={(v) => setConfig({ ...config, topic: v })}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SQL_TOPICS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Questions</Label>
            <Select
              value={String(config.count)}
              onValueChange={(v) => setConfig({ ...config, count: Number(v) })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SQL_COUNTS.map((c) => (
                  <SelectItem key={c} value={String(c)}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Minutes</Label>
            <Select
              value={String(config.duration)}
              onValueChange={(v) => setConfig({ ...config, duration: Number(v) })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SQL_DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="w-full gap-2" onClick={onStart}>
          <Play className="h-4 w-4" />
          Start SQL Session
        </Button>
      </CardContent>
    </Card>
  )
}