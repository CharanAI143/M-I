import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Clock } from 'lucide-react'
import { CONTEST_REMINDER_OPTIONS } from './settings-constants'

interface ContestRemindersCardProps {
  value: number
  onChange: (minutes: number) => void
}

export function ContestRemindersCard({ value, onChange }: ContestRemindersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Contest Reminders
        </CardTitle>
        <CardDescription>Choose how early to be notified before a contest starts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Remind Before Start
            </Label>
            <p className="text-sm text-muted-foreground">
              Applies to the contest countdown alarm on the dashboard.
            </p>
          </div>
          <Select
            value={String(value)}
            onValueChange={(val) => onChange(Number(val))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Reminder time" />
            </SelectTrigger>
            <SelectContent>
              {CONTEST_REMINDER_OPTIONS.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m >= 60
                    ? `${m / 60} hour${m / 60 === 1 ? '' : 's'} before`
                    : `${m} minutes before`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}