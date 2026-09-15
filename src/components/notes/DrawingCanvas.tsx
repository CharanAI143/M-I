import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

export interface DrawingCanvasHandle {
  clear: () => void
  toDataURL: () => string
}

interface DrawingCanvasProps {
  color: string
  strokeWidth: number
  src?: string
  srcKey?: string | null
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas({ color, strokeWidth, src, srcKey }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const lastPoint = useRef<{ x: number; y: number } | null>(null)
    const loadedKey = useRef<string | null | undefined>(null)

    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          const canvas = canvasRef.current
          const ctx = canvas?.getContext('2d')
          if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
        },
        toDataURL: () => {
          const canvas = canvasRef.current
          return canvas ? canvas.toDataURL('image/png') : ''
        },
      }),
      []
    )

    useEffect(() => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      if (!src) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        loadedKey.current = srcKey ?? null
        return
      }
      if (loadedKey.current === (srcKey ?? null)) return
      loadedKey.current = srcKey ?? null
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      img.src = src
    }, [src, srcKey])

    const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      setIsDrawing(true)
      lastPoint.current = getCanvasPoint(e)
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx && lastPoint.current) {
        ctx.beginPath()
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
        ctx.strokeStyle = color
        ctx.lineWidth = strokeWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return
      e.preventDefault()
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx || !lastPoint.current) return
      const p = getCanvasPoint(e)
      ctx.beginPath()
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
      ctx.lineTo(p.x, p.y)
      ctx.strokeStyle = color
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      lastPoint.current = p
    }

    const handlePointerUp = () => {
      setIsDrawing(false)
      lastPoint.current = null
    }

    return (
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    )
  }
)