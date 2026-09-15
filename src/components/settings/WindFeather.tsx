import { useEffect, useRef } from 'react'
import { QuillCircuitIcon } from './QuillCircuitIcon'

// Animated feather that glides on layered wind currents inside the Themes card.
export function WindFeather() {
  const windSectionRef = useRef<HTMLDivElement>(null)
  const featherElRef = useRef<HTMLDivElement>(null)
  const featherState = useRef({ x: 0, y: 0, vx: 0, vy: 0, t: 0, init: false })
  const draggingFeather = useRef(false)
  const dragOffset = useRef({ dx: 16, dy: 16 })
  const pointerVel = useRef({ vx: 0, vy: 0 })
  const lastPointer = useRef({ x: 0, y: 0, t: 0 })
  const swirlTimer = useRef(6)
  const swirl = useRef({ active: false, until: 0, x: 0, y: 0, dir: 1 })
  const FEATHER_SIZE = 32

  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16.667, 3)
      last = now
      const s = featherState.current
      const section = windSectionRef.current
      const rect = section ? section.getBoundingClientRect() : null

      if (section && rect) {
        if (!s.init) {
          s.x = -FEATHER_SIZE
          s.y = 4
          s.init = true
        }

        if (!draggingFeather.current) {
          // Flow the feather along a smooth, layered wind field (sine waves at
          // different periods) instead of random kicks — it glides and drifts.
          s.t += dt / 60
          let targetX =
            Math.sin(s.t * 0.12) * 1.3 +
            Math.sin(s.t * 0.9) * 0.3 +
            Math.sin(s.t * 0.23) * 0.25 +
            0.9
          let targetY =
            Math.sin(s.t * 1.4) * 0.28 +
            Math.sin(s.t * 0.55) * 0.3
          let ease = 0.02

          // Occasional random swirl: a passing vortex sweeps the feather around
          // a local center before it settles back into the base flow.
          if (swirl.current.active && s.t < swirl.current.until) {
            const c = swirl.current
            const dx = s.x - c.x
            const dy = s.y - c.y
            const dist = Math.hypot(dx, dy) || 1
            const strength = 1.6 * Math.min(1, 40 / (dist + 10))
            targetX = (-dy / dist) * c.dir * strength
            targetY = (dx / dist) * c.dir * strength
            ease = 0.035
          } else {
            swirl.current.active = false
          }

          swirlTimer.current -= dt / 60
          if (swirlTimer.current <= 0) {
            swirlTimer.current = 5 + Math.random() * 6
            const ang = Math.random() * Math.PI * 2
            const off = 22 + Math.random() * 36
            swirl.current = {
              active: true,
              until: s.t + 2 + Math.random() * 2.5,
              x: s.x + Math.cos(ang) * off,
              y: s.y + Math.sin(ang) * off,
              dir: Math.random() < 0.5 ? 1 : -1,
            }
          }

          // Ease the velocity toward the wind so motion stays fluid.
          s.vx += (targetX - s.vx) * ease * dt
          s.vy += (targetY - s.vy) * ease * dt
          s.x += s.vx * dt
          s.y += s.vy * dt

          if (s.x < -FEATHER_SIZE) {
            s.x = -FEATHER_SIZE
          }
          if (s.x > rect.width - FEATHER_SIZE) {
            // Despawn off the end (right edge), respawn at the start (left)
            s.x = -FEATHER_SIZE - 2
            s.y = 4 + Math.random() * Math.max(0, rect.height - FEATHER_SIZE - 8)
            s.vx = Math.abs(s.vx) || 0.9
            s.vy = 0
          }
          if (s.y < 0) {
            s.y = 0
            s.vy = Math.abs(s.vy) * 0.4 + 0.25
          }
          if (s.y > rect.height - FEATHER_SIZE) {
            s.y = rect.height - FEATHER_SIZE
            s.vy = -Math.abs(s.vy) * 0.3 - 0.3
          }
        }
      }

      const el = featherElRef.current
      if (el) {
        const tilt = Math.max(-18, Math.min(18, s.vx * 2))
        // Smooth fade at both edges: fade out approaching the right end,
        // fade back in as it enters from the left start.
        let opacity = 1
        if (rect) {
          const drawEnd = rect.width - FEATHER_SIZE
          const FADE = 40
          if (s.x > drawEnd - FADE) {
            opacity = Math.max(0, (drawEnd - s.x) / FADE)
          } else if (s.x < 0) {
            opacity = Math.min(1, (s.x + FEATHER_SIZE) / FEATHER_SIZE)
          }
        }
        el.style.left = `${s.x}px`
        el.style.top = `${s.y}px`
        el.style.transform = `rotate(${tilt}deg)`
        el.style.opacity = String(opacity)
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const section = windSectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const inside = x >= -12 && y >= -12 && x <= rect.width + 12 && y <= rect.height + 12
      if (!inside) return

      const now = performance.now()
      const dt = Math.max(now - lastPointer.current.t, 1)
      pointerVel.current.vx = (x - lastPointer.current.x) / dt
      pointerVel.current.vy = (y - lastPointer.current.y) / dt
      lastPointer.current = { x, y, t: now }

      const s = featherState.current
      if (draggingFeather.current) {
        s.x = Math.min(Math.max(0, x - dragOffset.current.dx), rect.width - FEATHER_SIZE)
        s.y = Math.min(Math.max(0, y - dragOffset.current.dy), rect.height - FEATHER_SIZE)
      } else {
        s.vx += pointerVel.current.vx * 0.25
        s.vy += pointerVel.current.vy * 0.12
      }
    }

    const up = () => {
      if (draggingFeather.current) {
        draggingFeather.current = false
        const s = featherState.current
        s.vx = Math.max(-6, Math.min(6, pointerVel.current.vx * 5))
        s.vy = Math.max(-6, Math.min(6, pointerVel.current.vy * 5))
      }
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  const handleFeatherPointerDown = (e: React.PointerEvent) => {
    const section = windSectionRef.current
    const rect = section?.getBoundingClientRect()
    dragOffset.current = {
      dx: rect ? e.clientX - rect.left - featherState.current.x : 16,
      dy: rect ? e.clientY - rect.top - featherState.current.y : 16,
    }
    draggingFeather.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  return (
    <div
      ref={windSectionRef}
      className="relative h-32 w-full overflow-hidden select-none"
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 32"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ color: 'var(--color-primary)' }}
      >
        <path
          d="M-6 30 Q 22 22 52 25 T 108 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="animate-wind"
          strokeDasharray="22 26"
          style={{ opacity: 0.25 }}
        />
        <path
          d="M-6 26 Q 26 12 56 16 T 108 1"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          className="animate-wind"
          strokeDasharray="14 20"
          style={{ opacity: 0.15, animationDelay: '-1.5s' }}
        />
        <path
          d="M-6 32 Q 34 26 62 29 T 108 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="animate-wind"
          strokeDasharray="18 24"
          style={{ opacity: 0.1, animationDelay: '-0.8s' }}
        />
      </svg>
      <div
        ref={featherElRef}
        onPointerDown={handleFeatherPointerDown}
        className="absolute cursor-grab touch-none active:cursor-grabbing"
        style={{ left: 0, top: 0, color: 'var(--color-primary)' }}
      >
        <QuillCircuitIcon className="h-8 w-8" />
      </div>
    </div>
  )
}