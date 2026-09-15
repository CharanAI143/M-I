import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ChevronLeft, Database, Play } from 'lucide-react'
import type { SqlConfig } from './sql-utils'

interface SqlPracticeSetupProps {
  config: SqlConfig
  setConfig: (c: SqlConfig) => void
  onStart: () => void
  onBack: () => void
}

export function SqlPracticeSetup({ config, setConfig, onStart, onBack }: SqlPracticeSetupProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm font-medium">New SQL Session</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Configure your session — pick a difficulty, a topic, and a time limit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Session title</Label>
            <Input
              placeholder="e.g. Analytics warm-up"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="h-9 text-sm"
            />
          </div>
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
                      {c} questions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Duration</Label>
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
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button className="gap-2" onClick={onStart}>
            <Play className="h-4 w-4" />
            Start SQL Session
          </Button>
          <Button variant="outline" className="gap-2" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}