import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'
import fireIcon from '@/fire.png'

interface StreakCardProps {
  streak: number
}

export function StreakCard({ streak }: StreakCardProps) {
  const streakWeeks = Math.floor(streak / 7)
  const fireFloatDistance = `${Math.min(6 + streakWeeks * 2, 34)}px`
  const fireAnimationDuration = `${Math.max(1.2, 3 - streakWeeks * 0.1)}s`
  const originalFireFilter = 'saturate(1.15) brightness(1.1) drop-shadow(0 0 10px rgba(255,107,0,0.6)) drop-shadow(0 0 20px rgba(255,69,0,0.4))'
  const weekFireFilter = 'hue-rotate(250deg) saturate(1.3) brightness(1.15) drop-shadow(0 0 12px rgba(168,85,247,0.7)) drop-shadow(0 0 24px rgba(139,92,246,0.5))'
  const fireFilter = streak > 0 && streak % 7 === 0 ? weekFireFilter : originalFireFilter

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
        <img
          src={fireIcon}
          alt="🔥"
          className="h-16 w-16 object-contain animate-float-fire"
          style={{
            ['--fire-float-distance' as string]: fireFloatDistance,
            animationDuration: fireAnimationDuration,
            filter: fireFilter,
          }}
        />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-orange-500">{streak}</span>
          <span className="text-sm text-muted-foreground">days</span>
        </div>
        <Badge variant="secondary" className="mt-2">
          <Zap className="mr-1 h-3 w-3" />
          Keep it going!
        </Badge>
      </CardContent>
    </Card>
  )
}