import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, Zap } from 'lucide-react'

interface VideoStatusBarProps {
  ytValidating: boolean
  ytValidatedSize: number
  unavailableCount: number
  fixing: boolean
  onFix: () => void
}

export function VideoStatusBar({
  ytValidating,
  ytValidatedSize,
  unavailableCount,
  fixing,
  onFix,
}: VideoStatusBarProps) {
  if (!ytValidating && ytValidatedSize === 0) return null

  return (
    <>
      {ytValidating && (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Validating videos...
        </span>
      )}
      {!ytValidating && ytValidatedSize > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Videos verified
          </span>
          {unavailableCount > 0 && !fixing && (
            <Button
              size="sm"
              variant="outline"
              onClick={onFix}
              className="h-6 px-2 text-xs gap-1"
            >
              <Zap className="h-3 w-3" />
              Fix Unavailable
            </Button>
          )}
          {fixing && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Fixing videos...
            </span>
          )}
        </div>
      )}
    </>
  )
}