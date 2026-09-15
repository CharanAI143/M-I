import { useEffect, useRef, useState } from 'react'
import { formatClock } from '@/lib/session-utils'

interface SessionTimerProps {
  duration: number
  onEnd: () => void
}

export function SessionTimer({ duration, onEnd }: SessionTimerProps) {
  const [remaining, setRemaining] = useState(duration * 60)
  const endRef = useRef(0)
  const doneRef = useRef(false)
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  useEffect(() => {
    if (endRef.current === 0) {
      endRef.current = Date.now() + duration * 60 * 1000
    }
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0 && !doneRef.current) {
        doneRef.current = true
        onEndRef.current()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [duration])

  const low = remaining <= 300

  return (
    <div className={`font-mono text-2xl font-bold tracking-wider ${low ? 'text-red-500 animate-pulse' : ''}`}>
      {formatClock(remaining)}
    </div>
  )
}