import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Monitor, Moon, Palette, Sun } from 'lucide-react'
import { COLOR_PRESETS } from './settings-constants'
import { WindFeather } from './WindFeather'

interface ThemesCardProps {
  theme: 'light' | 'dark' | 'system'
  colorScheme: string
  onThemeChange: (t: 'light' | 'dark' | 'system') => void
  onColorSchemeChange: (scheme: string) => void
}

export function ThemesCard({ theme, colorScheme, onThemeChange, onColorSchemeChange }: ThemesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Themes
        </CardTitle>
        <CardDescription>Customize the appearance of the application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Theme</Label>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onThemeChange('light')}
            >
              <Sun className="h-5 w-5" />
              <span className="text-xs">Light</span>
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onThemeChange('dark')}
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs">Dark</span>
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onThemeChange('system')}
            >
              <Monitor className="h-5 w-5" />
              <span className="text-xs">System</span>
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Color Scheme</Label>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant={colorScheme === key ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => onColorSchemeChange(key)}
              >
                <div
                  className="h-6 w-6 rounded-full border-2"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="text-xs">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <WindFeather />
      </CardContent>
    </Card>
  )
}