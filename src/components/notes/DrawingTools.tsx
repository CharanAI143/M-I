import { Button } from '@/components/ui/button'
import { Palette } from 'lucide-react'
import { COLORS, STROKE_WIDTHS } from './notes-utils'

interface DrawingToolsProps {
  color: string
  strokeWidth: number
  onColorChange: (c: string) => void
  onStrokeWidthChange: (w: number) => void
}

export function DrawingTools({ color, strokeWidth, onColorChange, onStrokeWidthChange }: DrawingToolsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1">
        <Palette className="h-4 w-4 text-muted-foreground" />
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className={`h-6 w-6 rounded-full border-2 transition-transform ${
              color === c
                ? 'scale-110 border-primary'
                : 'border-muted-foreground/30'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1">
        {STROKE_WIDTHS.map((sw) => (
          <Button
            key={sw.value}
            variant={strokeWidth === sw.value ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-2"
            onClick={() => onStrokeWidthChange(sw.value)}
          >
            {sw.label}
          </Button>
        ))}
      </div>
    </div>
  )
}