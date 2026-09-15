import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Database } from 'lucide-react'

interface SqlModeCardProps {
  enabled: boolean
  onToggle: (checked: boolean) => void
}

export function SqlModeCard({ enabled, onToggle }: SqlModeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          SQL Mode
        </CardTitle>
        <CardDescription>
          Enable a dedicated SQL tab with an interactive practice panel for querying
          hands-on questions with a built-in database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>SQL Mode</Label>
            <p className="text-sm text-muted-foreground">
              Adds a <span className="text-primary">SQL</span> tab to the sidebar with a live
              query editor, schema browser, and practice problems — just like the coding panel.
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
          />
        </div>

        {enabled && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Head over to the <span className="text-primary">SQL</span> tab to start practicing.
          </div>
        )}
      </CardContent>
    </Card>
  )
}