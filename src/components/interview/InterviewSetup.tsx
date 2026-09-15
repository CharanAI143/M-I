import {
  INTERVIEW_COUNTS,
  INTERVIEW_DURATIONS,
  QUESTION_TOPICS,
  QUESTION_SOURCES,
  SOURCE_LABELS,
  type InterviewConfig,
} from '@/lib/interview'
import type { QuestionSource } from '@/lib/types'
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
import { Check, Mic, Play, Send } from 'lucide-react'

interface InterviewSetupProps {
  config: InterviewConfig
  onConfigChange: (patch: Partial<InterviewConfig>) => void
  sourceFilter: '' | QuestionSource
  onSourceFilterChange: (s: '' | QuestionSource) => void
  postedMsg: string | null
  onStart: () => void
  onPostToPlanner: () => void
}

export function InterviewSetup({
  config,
  onConfigChange,
  sourceFilter,
  onSourceFilterChange,
  postedMsg,
  onStart,
  onPostToPlanner,
}: InterviewSetupProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm font-medium">New Interview</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Configure your session — pick a difficulty, a topic, and a time limit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label className="text-xs">Session title</Label>
            <Input
              placeholder="e.g. Google warm-up"
              value={config.title}
              onChange={(e) => onConfigChange({ title: e.target.value })}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Difficulty</Label>
            <Select
              value={config.difficulty}
              onValueChange={(v) => onConfigChange({ difficulty: v as InterviewConfig['difficulty'] })}
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
            <Select
              value={config.topic}
              onValueChange={(v) => onConfigChange({ topic: v })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Questions</Label>
            <Select
              value={String(config.count)}
              onValueChange={(v) => onConfigChange({ count: Number(v) })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_COUNTS.map((c) => (
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
              onValueChange={(v) => onConfigChange({ duration: Number(v) })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Source:</span>
          {(['', ...QUESTION_SOURCES] as const).map((s) => (
            <button
              key={s || 'all'}
              onClick={() => onSourceFilterChange(s as '' | QuestionSource)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                sourceFilter === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background text-foreground hover:bg-accent'
              }`}
            >
              {s === '' ? 'All sources' : SOURCE_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button className="gap-2" onClick={onStart} disabled={config.count < 1}>
            <Play className="h-4 w-4" />
            Start Interview
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={onPostToPlanner}
            disabled={config.count < 1}
          >
            <Send className="h-4 w-4" />
            P'o'P
          </Button>
          {postedMsg && (
            <span className="flex items-center gap-1.5 text-sm text-green-500">
              <Check className="h-4 w-4" />
              {postedMsg}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}