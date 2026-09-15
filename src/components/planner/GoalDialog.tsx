import { useEffect, useState } from 'react'
import { dbApi } from '@/lib/db'
import type { Goal, GoalCategory, GoalType } from '@/lib/types'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { rangeForType, unitFor } from './planner-utils'

interface GoalDialogProps {
  goal: Goal | null
  onClose: () => void
  onSaved: () => void
}

export function GoalDialog({ goal, onClose, onSaved }: GoalDialogProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<GoalType>('weekly')
  const [category, setCategory] = useState<GoalCategory>('problems')
  const [target, setTarget] = useState('10')

  useEffect(() => {
    if (goal) {
      setTitle(goal.title)
      setType(goal.type)
      setCategory(goal.category)
      setTarget(String(goal.target_value))
    } else {
      setTitle('')
      setType('weekly')
      setCategory('problems')
      setTarget('10')
    }
  }, [goal])

  const effectiveCategory: GoalCategory = type === 'streak' ? 'problems' : category
  const unit = unitFor(effectiveCategory, type)

  const canSave = title.trim().length > 0 && Number(target) > 0

  const save = async () => {
    if (!canSave) return
    if (goal) {
      await dbApi.updateGoal(goal.id, {
        title: title.trim(),
        type,
        category: effectiveCategory,
        target_value: Number(target),
        unit,
      })
    } else {
      const range = rangeForType(type)
      await dbApi.addGoal({
        title: title.trim(),
        type,
        category: effectiveCategory,
        target_value: Number(target),
        current_value: 0,
        unit,
        start_date: range.start,
        end_date: range.end,
        status: 'active',
      })
    }
    onSaved()
    onClose()
  }

  return (
    <Dialog open={goal !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'New Goal'}</DialogTitle>
          <DialogDescription>
            {type === 'streak'
              ? 'Maintain your solving streak for this many days.'
              : `Progress is tracked automatically for problems and focus minutes.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 50 problems this month" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Period</Label>
              <Select value={type} onValueChange={(v) => setType(v as GoalType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Counts</Label>
              <Select
                value={effectiveCategory}
                onValueChange={(v) => setCategory(v as GoalCategory)}
                disabled={type === 'streak'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="problems">Problems solved</SelectItem>
                  <SelectItem value="minutes">Focus minutes</SelectItem>
                  <SelectItem value="topics">Topics (manual)</SelectItem>
                  {goal && <SelectItem value="questions">Questions (from Interview tab)</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Target ({unit})</Label>
            <Input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!canSave}>
            {goal ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}