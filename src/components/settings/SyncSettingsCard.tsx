import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, RefreshCw, Trash2 } from 'lucide-react'
import { SYNC_FREQUENCIES } from './settings-constants'

interface SyncSettingsCardProps {
  autoSync: boolean
  launchAtLogin: boolean
  syncFrequency: number
  lastSynced: string | null
  onToggleAutoSync: (checked: boolean) => void
  onToggleLaunchAtLogin: (checked: boolean) => void
  onSyncFrequencyChange: (minutes: number) => void
  onReset: () => void
}

export function SyncSettingsCard({
  autoSync,
  launchAtLogin,
  syncFrequency,
  lastSynced,
  onToggleAutoSync,
  onToggleLaunchAtLogin,
  onSyncFrequencyChange,
  onReset,
}: SyncSettingsCardProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sync Settings
        </CardTitle>
        <CardDescription>Configure data synchronization preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto-Sync</Label>
            <p className="text-sm text-muted-foreground">Automatically sync data at regular intervals.</p>
          </div>
          <Switch
            checked={autoSync}
            onCheckedChange={onToggleAutoSync}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Open at Login</Label>
            <p className="text-sm text-muted-foreground">
              Start MI Coding Tracker when you sign in so contest reminders keep working.
            </p>
          </div>
          <Switch
            checked={launchAtLogin}
            onCheckedChange={onToggleLaunchAtLogin}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sync Frequency
            </Label>
            <p className="text-sm text-muted-foreground">How often to auto-sync data.</p>
          </div>
          <Select
            value={String(syncFrequency)}
            onValueChange={(val) => onSyncFrequencyChange(Number(val))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Frequency" />
            </SelectTrigger>
            <SelectContent>
              {SYNC_FREQUENCIES.map((freq) => (
                <SelectItem key={freq} value={String(freq)}>
                  Every {freq} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Last Synced</Label>
            <p className="text-sm text-muted-foreground">
              {lastSynced ?? 'Never synced'}
            </p>
          </div>
          <Badge variant="secondary">{lastSynced ? 'Synced' : 'Pending'}</Badge>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-destructive">Danger Zone</Label>
            <p className="text-sm text-muted-foreground">Reset all data to factory defaults.</p>
          </div>
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onReset()
                  setShowResetConfirm(false)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Confirm Reset
              </Button>
            </div>
          ) : (
            <Button variant="destructive" size="sm" onClick={() => setShowResetConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Reset All Data
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}