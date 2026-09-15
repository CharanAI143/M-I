import { useEffect, useRef, useState } from 'react'
import { getSchemeRgb } from '@/lib/colorScheme'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  baseAlpha: number
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [dark, setDark] = useState<boolean>(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
  const [rgb, setRgb] = useState<[number, number, number]>(() => getSchemeRgb())

  useEffect(() => {
    const update = () => {
      setDark(document.documentElement.classList.contains('dark'))
      setRgb(getSchemeRgb())
    }
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = glowRef.current
    if (!el) return
    const move = (e: MouseEvent) => {
      el.style.opacity = '1'
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }
    const leave = () => {
      el.style.opacity = '0'
    }
    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseleave', leave)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mouse = { x: -9999, y: -9999 }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const [r, g, b] = rgb
    const particleColor = dark
      ? `${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}`
      : `${r}, ${g}, ${b}`
    const lineColor = `${r}, ${g}, ${b}`
    const COUNT = 80
    const LINK_DIST = 160
    const CURSOR_DIST = 220
    const MIN_COUNT = 12
    const DESIGN_AREA = 1400 * 900
    const LINK_SHARE = (LINK_DIST * LINK_DIST * COUNT) / DESIGN_AREA
    // Particle speed in pixels/second (matches the old ~0.6 px/frame @ 60fps
    // look) so motion is identical regardless of frame rate or window size.
    const MAX_SPEED = 36
    const FRAME_RATE = 60

    let particles: Particle[] = []
    let raf = 0
    let w = 0
    let h = 0
    let lastFrame = 0
    let running = true

    const resize = () => {
      const nextW = window.innerWidth
      const nextH = window.innerHeight
      // Ignore degenerate sizes (e.g. the 0x0 reported while the window is
      // minimized) so particles are never squashed into a point, which is what
      // made the background appear to move extremely fast during minimize.
      if (nextW <= 0 || nextH <= 0) return
      w = nextW
      h = nextH
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = () => {
      // Scale particle count with the canvas so a tiny window isn't overcrowded.
      const count = Math.max(MIN_COUNT, Math.round((COUNT * w * h) / DESIGN_AREA))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * MAX_SPEED,
        vy: (Math.random() - 0.5) * MAX_SPEED,
        r: Math.random() * 2 + 1.2,
        baseAlpha: Math.random() * 0.4 + 0.5,
      }))
    }

    const draw = (now: number) => {
      if (!running) return
      // Time-based motion: speed is independent of frame rate and of how long
      // the app spent minimized/hidden, so it can never look abnormally fast
      // after minimize/maximize. Clamped so a long pause can't cause a jump.
      if (!lastFrame) lastFrame = now
      const dt = Math.min((now - lastFrame) / 1000, 0.05)
      lastFrame = now
      const step = dt * FRAME_RATE

      // Keep the linked-area-per-particle equal to the design window so a small
      // window holds the same sparse constellation instead of a dense web.
      const dens = Math.hypot(w, h)
      const linkDist = Math.max(30, Math.min(LINK_DIST, Math.sqrt((LINK_SHARE * w * h) / particles.length)))
      const cursorDist = Math.max(64, Math.min(CURSOR_DIST, dens * 0.34))
      const repelDist = Math.max(24, Math.min(120, dens * 0.3))

      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        if (dist !== 0 && dist < repelDist) {
          const force = (repelDist - dist) / repelDist
          p.vx += ((dx / dist) * force * 0.08) * step
          p.vy += ((dy / dist) * force * 0.08) * step
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b2 = particles[j]
          const dx = a.x - b2.x
          const dy = a.y - b2.y
          const dist = Math.hypot(dx, dy)
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.5
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b2.x, b2.y)
            ctx.stroke()
          }
        }

        const p = particles[i]
        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y)
        if (md < cursorDist) {
          const alpha = (1 - md / cursorDist) * 0.8
          ctx.strokeStyle = `rgba(${particleColor}, ${alpha})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${particleColor}, ${p.baseAlpha})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    const trackMouse = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const clearMouse = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    // Pause the animation while the app is minimized/hidden. The window keeps
    // firing frames (backgroundThrottling is disabled), which previously let
    // particles keep drifting at full speed while minimized and made the
    // background look like it was racing ahead on restore.
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        lastFrame = 0
        resize()
        raf = requestAnimationFrame(draw)
      }
    }

    let resizeRaf = 0
    const handleResize = () => {
      // Debounce: minimize/maximize fire a burst of resize events, and each
      // one previously re-scattered all particles. Batch them into one pass
      // and only re-scatter when the size actually changed. Degenerate (0x0)
      // sizes reported while minimizing are ignored inside resize().
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0
        const prevW = w
        const prevH = h
        resize()
        if (Math.abs(w - prevW) > 4 || Math.abs(h - prevH) > 4) spawn()
      })
    }

    resize()
    spawn()
    draw(performance.now())
    window.addEventListener('mousemove', trackMouse, { passive: true })
    window.addEventListener('mouseleave', clearMouse)
    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      window.removeEventListener('mousemove', trackMouse)
      window.removeEventListener('mouseleave', clearMouse)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [dark, rgb])

  const [r, g, b] = rgb
  const glowColor = dark
    ? `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, 0.55)`
    : `rgba(${r}, ${g}, ${b}, 0.40)`

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div
        ref={glowRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 560,
          height: 560,
          background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
          filter: 'blur(6px)',
          opacity: 0,
          transition: 'opacity .4s ease, left .12s ease-out, top .12s ease-out',
          willChange: 'left, top, opacity',
        }}
      />
    </div>
  )
}