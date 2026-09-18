import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Pin } from 'lucide-react'

export function AlwaysOnTopCard() {
  const [alwaysOnTop, setAlwaysOnTop] = useState(false)

  useEffect(() => {
    window.overlay
      ?.get()
      .then((r) => setAlwaysOnTop(r.enabled))
      .catch(() => {})
  }, [])

  const handleToggle = (checked: boolean) => {
    setAlwaysOnTop(checked)
    window.overlay
      ?.set(checked)
      .then((r) => setAlwaysOnTop(r.enabled))
      .catch(() => setAlwaysOnTop(!checked))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pin className="h-5 w-5" />
          Always on Top
        </CardTitle>
        <CardDescription>Keep MI Coding Tracker floating above other apps, like the Copilot panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Hover over other apps</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, the window stays pinned above other apps even when you click away.
            </p>
          </div>
          <Switch checked={alwaysOnTop} onCheckedChange={handleToggle} />
        </div>
      </CardContent>
    </Card>
  )
}