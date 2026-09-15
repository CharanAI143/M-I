import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Sparkles } from 'lucide-react'
import type { PosterCategory } from '@/lib/types'
import { POSTER_CATEGORIES } from './settings-constants'

interface DashboardCardsCardProps {
  animePoster: boolean
  posterCategory: PosterCategory
  onTogglePoster: (checked: boolean) => void
  onCategoryChange: (cat: PosterCategory) => void
}

export function DashboardCardsCard({
  animePoster,
  posterCategory,
  onTogglePoster,
  onCategoryChange,
}: DashboardCardsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Dashboard Cards
        </CardTitle>
        <CardDescription>Choose which dashboard cards are shown.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Quote Poster</Label>
            <p className="text-sm text-muted-foreground">
              Show the daily quote poster on the dashboard and SQL tab.
            </p>
          </div>
          <Switch
            checked={animePoster}
            onCheckedChange={onTogglePoster}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Poster Theme</Label>
          <p className="text-sm text-muted-foreground">
            Pick the gallery the poster draws from — <span className="text-primary">All</span> shows
            every postcard with no filtering.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {POSTER_CATEGORIES.map((cat) => {
              const active = posterCategory === cat.id
              return (
                <Button
                  key={cat.id}
                  type="button"
                  variant={active ? 'default' : 'outline'}
                  className="flex h-auto flex-col items-center gap-2 py-4 transition-all"
                  style={
                    active
                      ? { backgroundColor: cat.color, borderColor: cat.color }
                      : undefined
                  }
                  onClick={() => onCategoryChange(cat.id)}
                >
                  {cat.mark}
                  <span className={`text-xs font-semibold ${active ? 'text-white' : ''}`}>
                    {cat.label}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}