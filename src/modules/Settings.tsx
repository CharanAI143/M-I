import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useAppStore, resetAllData, dbStore, defaultSettings } from '@/store'
import { secureStoreApiKey, secureDeleteApiKey } from '@/lib/secure'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RefreshCw, Key, Palette, Clock, Shield, Trash2, Eye, EyeOff, CheckCircle2, AlertCircle, Save, Monitor, Sun, Moon, Lock, LockOpen, Bell, Database, Sparkles, LayoutGrid } from 'lucide-react'
import type { AISettings, PosterCategory } from '@/lib/types'
import { applyTheme, type Theme } from '@/lib/theme'

const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-4o'],
  anthropic: ['claude-sonnet-5', 'claude-opus-5', 'claude-haiku-4-5'],
  gemini: ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash-lite'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  custom: [],
}

const SYNC_FREQUENCIES = [5, 10, 15, 30, 60]

const CONTEST_REMINDER_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120]

const COLOR_PRESETS: Record<string, { name: string; color: string }> = {
  blue: { name: 'Blue', color: '#3b82f6' },
  purple: { name: 'Purple', color: '#8b5cf6' },
  green: { name: 'Green', color: '#22c55e' },
  orange: { name: 'Orange', color: '#f97316' },
}

// Quote poster galleries. Each button shows the real logo of its gallery:
// the Marvel "MARVEL" wordmark, the DC bullet, and a kitsune (fox) mask as
// the classic anime symbol.
const POSTER_CATEGORIES: { id: PosterCategory; label: string; color: string; mark: ReactNode }[] = [
  {
    id: 'all',
    label: 'All',
    color: '#8b5cf6',
    mark: (
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_0_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <LayoutGrid className="h-5 w-5" style={{ color: '#8b5cf6' }} aria-hidden="true" />
      </span>
    ),
  },
  {
    id: 'marvel',
    label: 'Marvel',
    color: '#c8102e',
    mark: (
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_0_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <svg viewBox="-80 -60 840 360" className="h-3.5 w-auto" fill="#ed1d24" aria-hidden="true">
          <path d="M631.063,7.184v-61.603H459.644l-28.191,205.803L403.557-54.418H341.74l6.925,54.915c-7.14-14.068-32.449-54.915-88.146-54.915c-0.367-0.024-61.901,0-61.901,0l-0.237,299.974L153.324-54.418l-80.959-0.047L25.753,256.349L25.777-54.42h-77.483l-27.933,174.585l-27.208-174.583h-77.508v337.906h61.036V120.618l27.764,162.866h32.449l27.374-162.866v162.866H81.935l7.14-51.995h47.374l7.116,51.995l115.521,0.071h0.094v-0.071h0.072h0.072V173.799l14.162-2.063l29.319,111.819h0.072h59.61h0.07l-0.024-0.071h0.106h0.072l-38.475-131.057c19.498-14.422,41.513-51.047,35.654-86.084V66.32c0.07,0.474,36.316,217.38,36.316,217.38l71.065-0.216L515.83-22.8v306.285h115.236v-60.773h-54.7v-77.496h54.7V83.518h-54.7V7.184H631.063z M96.265,177.905l16.758-144.461l17.4,144.461H96.265z M273.684,111.201c-4.697,2.278-9.595,3.417-14.363,3.417V5.927c0.083,0,0.179-0.022,0.297-0.022c4.78-0.024,40.419,1.446,40.419,53.774C300.037,87.052,287.916,104.299,273.684,111.201 M754.044,222.665v60.772H641.63V-54.465h60.526v277.13H754.044z" />
        </svg>
      </span>
    ),
  },
  {
    id: 'dc',
    label: 'DC',
    color: '#111111',
    mark: (
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_0_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#0d0d0d" aria-hidden="true">
          <path d="M5.215 8.787h2.154c.601 0 1.088.487 1.088 1.088v4.954c0 .6-.487 1.088-1.088 1.088H6.05V9.475a.159.159 0 00-.066-.129zM12 23.099a11.078 11.078 0 01-8.659-4.155.046.046 0 01.036-.074h5.936a.26.26 0 00.153-.05l2.27-1.648a.159.159 0 00.064-.128V7.616a.159.159 0 00-.065-.129L9.466 5.84a.261.261 0 00-.153-.05H2.886a.046.046 0 01-.037-.071A11.087 11.087 0 0112 .9c3.798 0 7.15 1.907 9.151 4.817a.046.046 0 01-.038.071h-1.597c-.052 0-.1.03-.123.079l-.353.757-1.082-.786a.26.26 0 00-.153-.05h-2.553a.261.261 0 00-.154.05L12.83 7.487a.159.159 0 00-.065.129v9.428c0 .05.024.098.065.128l2.27 1.648a.26.26 0 00.153.05h5.371c.038 0 .06.045.036.074A11.078 11.078 0 0112 23.1zM1.602 8.3l1.038.755c.043.03.068.08.068.132v8.73c0 .046-.06.063-.084.025A11.046 11.046 0 01.901 12c0-1.289.22-2.526.624-3.677a.05.05 0 01.077-.024zm13.67.488h3.225v1.776c0 .046.038.084.084.084h2.701a.098.098 0 00.096-.083l.535-3.374c.007-.044.066-.053.086-.013a11.053 11.053 0 011.1 4.823 11.05 11.05 0 01-1.39 5.382c-.022.04-.084.024-.084-.023v-3.084a.084.084 0 00-.084-.084h-2.96a.084.084 0 00-.084.084v1.642h-1.301a1.089 1.089 0 01-1.089-1.088V9.475a.159.159 0 00-.065-.129zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Z" />
        </svg>
      </span>
    ),
  },
  {
    id: 'anime',
    label: 'Anime',
    color: '#ef4444',
    mark: (
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_0_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
          <path d="M4.2 1.6 L8.8 6.2 L3.4 8.7 Z" fill="#ef4444" stroke="#1f2937" strokeWidth="1" strokeLinejoin="round" />
          <path d="M19.8 1.6 L15.2 6.2 L20.6 8.7 Z" fill="#ef4444" stroke="#1f2937" strokeWidth="1" strokeLinejoin="round" />
          <path
            d="M5.6 8.8 C2.8 10.8 2 14 3.4 17.2 C4.8 20.4 8.2 22.3 12 22.3 C15.8 22.3 19.2 20.4 20.6 17.2 C22 14 21.2 10.8 18.4 8.8 C16.4 9.6 14.4 10 12 10 C9.6 10 7.6 9.6 5.6 8.8 Z"
            fill="#fff"
            stroke="#1f2937"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path d="M7.4 12.6 L10.9 11.8" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16.6 12.6 L13.1 11.8" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="15.8" r="0.9" fill="#1f2937" />
          <path d="M7.2 14.3 L8.7 16.9 L9.9 14.1 Z" fill="#ef4444" />
          <path d="M16.8 14.3 L15.3 16.9 L14.1 14.1 Z" fill="#ef4444" />
        </svg>
      </span>
    ),
  },
]

function QuillCircuitIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <path d="M17.5 15H9" />
      <path d="M14 18H6" />
      <circle cx="17.5" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="2" cy="22" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function Settings() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const lastSynced = useAppStore((s) => s.lastSynced)
  const aiSettings = settings.ai

  const [syncFrequency, setSyncFrequency] = useState<number>(settings.syncInterval ?? 15)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [launchAtLogin, setLaunchAtLogin] = useState(false)

  const [provider, setProvider] = useState<string>(aiSettings?.provider ?? 'openai')
  const [apiKey, setApiKey] = useState<string>(aiSettings?.apiKey ?? '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null)
  const [model, setModel] = useState<string>(aiSettings?.model ?? '')
  const [customEndpoint, setCustomEndpoint] = useState<string>(aiSettings?.customEndpoint ?? '')

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [colorScheme, setColorScheme] = useState<string>('blue')
  const [hasUnsavedAi, setHasUnsavedAi] = useState(false)
  const [savingAi, setSavingAi] = useState(false)
  const [aiSaved, setAiSaved] = useState(false)

  const [keyLocked, setKeyLocked] = useState<boolean>(
    () => Boolean(aiSettings?.apiKey) && localStorage.getItem('mi_api_key_locked') === '1'
  )
  const [lockMessage, setLockMessage] = useState<string>(
    () => (Boolean(aiSettings?.apiKey) && localStorage.getItem('mi_api_key_locked') === '1' ? 'API KEY Locked' : '')
  )
  // One-Time Password unlock for the API key. A fresh random 7-digit code is
  // generated every time the dialog opens; it is never reused — it expires
  // after OTP_TTL_MS, is discarded when the dialog closes, and is invalidated
  // after a successful unlock.
  const OTP_TTL_MS = 60_000
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [otpCode, setOtpCode] = useState<string>('')
  const [otpExpiresAt, setOtpExpiresAt] = useState(0)
  const [otpNow, setOtpNow] = useState(Date.now())
  const [otpInput, setOtpInput] = useState('')
  const [otpError, setOtpError] = useState('')
  const lockTapTimes = useRef<number[]>([])

  // Live countdown while the OTP dialog is open.
  useEffect(() => {
    if (!otpDialogOpen) return
    const id = setInterval(() => setOtpNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [otpDialogOpen])

  // Load the current "open at login" state from the main process.
  useEffect(() => {
    if (!window.app?.getLaunchAtLogin) return
    window.app
      .getLaunchAtLogin()
      .then((r) => setLaunchAtLogin(r.enabled))
      .catch(() => {})
  }, [])

  // Generate a brand-new 7-digit one-time password. Never stored, never reused.
  function regenerateOtp(): string {
    const generated = String(Math.floor(1000000 + Math.random() * 9000000))
    setOtpCode(generated)
    setOtpExpiresAt(Date.now() + OTP_TTL_MS)
    return generated
  }

  function openOtpDialog() {
    regenerateOtp()
    setOtpInput('')
    setOtpError('')
    setOtpDialogOpen(true)
  }

  function closeOtpDialog() {
    setOtpDialogOpen(false)
    setOtpCode('')
    setOtpExpiresAt(0)
    setOtpInput('')
    setOtpError('')
  }

  const otpExpired = otpDialogOpen && Date.now() >= otpExpiresAt
  const otpRemainingMs = otpDialogOpen ? Math.max(0, otpExpiresAt - otpNow) : 0
  const otpCountdown = Math.ceil(otpRemainingMs / 1000)

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
            const r = section.getBoundingClientRect()
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
  useEffect(() => {
    const stored = localStorage.getItem('mi_theme') as 'light' | 'dark' | 'system' | null
    const scheme = localStorage.getItem('mi_color_scheme')
    if (stored) setTheme(stored)
    if (scheme) setColorScheme(scheme)
    applyTheme(stored ?? 'system')
  }, [])

  useEffect(() => {
    const handler = () => {
      if (theme === 'system') applyTheme('system')
    }
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [theme])

  useEffect(() => {
    const models = PROVIDER_MODELS[provider] ?? []
    if (models.length > 0 && !models.includes(model)) {
      setModel(models[0])
      setHasUnsavedAi(true)
    }
  }, [provider])

  // Sync local AI fields whenever persisted settings load/change
  // (prevents reverting to the default provider after app restart)
  useEffect(() => {
    if (aiSettings?.provider) setProvider(aiSettings.provider)
    if (aiSettings?.model) setModel(aiSettings.model)
    if (aiSettings?.apiKey) setApiKey(aiSettings.apiKey)
    setCustomEndpoint(aiSettings?.customEndpoint ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSettings])

  useEffect(() => {
    setHasUnsavedAi(true)
  }, [apiKey, model, customEndpoint])

  // The lock only makes sense when an actual API key exists. If the stored key
  // disappears (empty / not yet loaded), clear a stale lock flag so the field
  // is never stuck disabled with no key present.
  useEffect(() => {
    if (!aiSettings?.apiKey) {
      if (keyLocked || localStorage.getItem('mi_api_key_locked') === '1') {
        setKeyLocked(false)
        setLockMessage('')
        localStorage.setItem('mi_api_key_locked', '0')
      }
    } else if (localStorage.getItem('mi_api_key_locked') === '1' && !keyLocked) {
      setKeyLocked(true)
      setLockMessage('API KEY Locked')
    }
  }, [aiSettings?.apiKey])

  async function handleResetAll() {
    await resetAllData()
    await secureDeleteApiKey()
    useAppStore.getState().resetStore()
    setShowResetConfirm(false)
    setProvider('openai')
    setApiKey('')
    setModel('gpt-4o')
    setCustomEndpoint('')
    setApiKeyValid(null)
    setHasUnsavedAi(false)
    setKeyLocked(false)
    setLockMessage('API KEY Unlocked!')
    setTheme('system')
    setColorScheme('blue')
    applyTheme('system')
    document.documentElement.style.setProperty('--color-primary', COLOR_PRESETS.blue.color)
  }

  function handleThemeChange(newTheme: 'light' | 'dark' | 'system') {
    setTheme(newTheme)
    localStorage.setItem('mi_theme', newTheme)
    applyTheme(newTheme)
  }

  function handleColorSchemeChange(scheme: string) {
    setColorScheme(scheme)
    localStorage.setItem('mi_color_scheme', scheme)
    document.documentElement.style.setProperty('--color-primary', COLOR_PRESETS[scheme].color)
  }

  async function handleSaveAiSettings() {
    setSavingAi(true)
    setAiSaved(false)
    try {
      const ai: AISettings = {
        provider: provider as AISettings['provider'],
        apiKey,
        model,
        customEndpoint: provider === 'custom' ? customEndpoint : '',
      }
      updateSettings({ ai, syncInterval: syncFrequency })
      await secureStoreApiKey(apiKey)
      // Remove any legacy plaintext key from the renderer database
      await dbStore.delete('ai_api_key')
      await dbStore.set('ai_provider', provider)
      await dbStore.set('ai_model', model)
      await dbStore.set('ai_custom_endpoint', provider === 'custom' ? customEndpoint : '')
      setApiKeyValid(true)
      setHasUnsavedAi(false)
      setAiSaved(true)
      setTimeout(() => setAiSaved(false), 2000)
    } finally {
      setSavingAi(false)
    }
  }

  function handleApiKeyChange(value: string) {
    setApiKey(value)
    setApiKeyValid(value.length > 10 ? true : value.length === 0 ? null : false)
    if (!value && keyLocked) {
      persistLock(false)
    }
  }

  function handleApiKeyPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = (e.clipboardData?.getData('text') ?? '').trim()
    // Only lock when the paste actually contains a key-like value; an empty
    // or non-key clipboard must never disable the field.
    if (pasted.length < 10) return
    // Auto-lock after a short delay to allow the paste to complete
    setTimeout(() => {
      if (!keyLocked) {
        persistLock(true)
        setShowApiKey(false)
      }
    }, 100)
  }

  function persistLock(locked: boolean) {
    setKeyLocked(locked)
    localStorage.setItem('mi_api_key_locked', locked ? '1' : '0')
    if (!locked) setLockMessage('API KEY Unlocked!')
    else setLockMessage('API KEY Locked')
  }

  // Triple-click the lock button within 2s to trigger the One-Time Password
  // request. The user enters the 7-digit passcode to unlock and edit the key.
  function handleToggleLock() {
    if (!keyLocked) {
      persistLock(true)
      setShowApiKey(false)
      return
    }
    const now = Date.now()
    lockTapTimes.current.push(now)
    lockTapTimes.current = lockTapTimes.current.filter((t) => now - t <= 2000)
    if (lockTapTimes.current.length >= 3) {
      lockTapTimes.current = []
      openOtpDialog()
    }
  }

  function handleLockClick() {
    if (keyLocked) {
      handleToggleLock()
    } else {
      persistLock(true)
      setShowApiKey(false)
    }
  }

  function handleOtpSubmit() {
    if (otpExpired || !otpCode) {
      setOtpError('This one-time password has expired. Generate a new one below.')
      setOtpInput('')
      return
    }
    if (otpInput.trim() === otpCode) {
      persistLock(false)
      setShowApiKey(false)
      closeOtpDialog()
    } else {
      setOtpError('Incorrect passcode. Try again.')
      setOtpInput('')
    }
  }

  // Generate a fresh one-time password. The previous code is invalidated.
  function handleOtpResend() {
    regenerateOtp()
    setOtpInput('')
    setOtpError('New one-time password generated. Uses only once — expires in 60s.')
    setOtpNow(Date.now())
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your application preferences and configurations.</p>
      </div>

      <Separator />

      {/* Sync Settings */}
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
              checked={settings?.autoSync ?? false}
              onCheckedChange={(checked) => {
                updateSettings({ autoSync: checked })
              }}
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
              onCheckedChange={(checked) => {
                setLaunchAtLogin(checked)
                window.app?.setLaunchAtLogin(checked).catch(() => {})
              }}
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
              onValueChange={(val) => {
                setSyncFrequency(Number(val))
                updateSettings({ syncInterval: Number(val) })
              }}
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
                <Button variant="destructive" size="sm" onClick={handleResetAll}>
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

      {/* Contest Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Contest Reminders
          </CardTitle>
          <CardDescription>Choose how early to be notified before a contest starts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Remind Before Start
              </Label>
              <p className="text-sm text-muted-foreground">
                Applies to the contest countdown alarm on the dashboard.
              </p>
            </div>
            <Select
              value={String(settings?.contestRemindMinutes ?? 15)}
              onValueChange={(val) => {
                const minutes = Number(val)
                updateSettings({ contestRemindMinutes: minutes })
                dbStore.set('contest_remind_minutes', String(minutes))
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Reminder time" />
              </SelectTrigger>
              <SelectContent>
                {CONTEST_REMINDER_OPTIONS.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m >= 60
                      ? `${m / 60} hour${m / 60 === 1 ? '' : 's'} before`
                      : `${m} minutes before`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Dashboard Cards
          </CardTitle>
          <CardDescription>Choose which dashboard cards are shown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quote Poster</Label>
              <p className="text-sm text-muted-foreground">
                Show the daily quote poster on the dashboard and SQL tab.
              </p>
            </div>
            <Switch
              checked={settings?.animePoster ?? true}
              onCheckedChange={(checked) => {
                updateSettings({ animePoster: checked })
                dbStore.set('anime_poster', String(checked))
              }}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Poster Theme</Label>
            <p className="text-sm text-muted-foreground">
              Pick the gallery the poster draws from — <span className="text-primary">All</span> shows
              every postcard with no filtering.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {POSTER_CATEGORIES.map((cat) => {
                const active = (settings?.posterCategory ?? 'anime') === cat.id
                return (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={active ? 'default' : 'outline'}
                    className="flex h-auto flex-col items-center gap-2 py-4 transition-all"
                    style={
                      active
                        ? { backgroundColor: cat.color, borderColor: cat.color }
                        : undefined
                    }
                    onClick={() => {
                      updateSettings({ posterCategory: cat.id })
                      dbStore.set('poster_category', cat.id)
                    }}
                  >
                    {cat.mark}
                    <span className={`text-xs font-semibold ${active ? 'text-white' : ''}`}>
                      {cat.label}
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SQL Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SQL Mode
          </CardTitle>
          <CardDescription>
            Enable a dedicated SQL tab with an interactive practice panel for querying
            hands-on questions with a built-in database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SQL Mode</Label>
              <p className="text-sm text-muted-foreground">
                Adds a <span className="text-primary">SQL</span> tab to the sidebar with a live
                query editor, schema browser, and practice problems — just like the coding panel.
              </p>
            </div>
            <Switch
              checked={settings?.sqlMode ?? false}
              onCheckedChange={(checked) => {
                updateSettings({ sqlMode: checked })
                dbStore.set('sql_mode', String(checked))
              }}
            />
          </div>

          {settings?.sqlMode && (
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Head over to the <span className="text-primary">SQL</span> tab to start practicing.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credits & AI Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Credits & AI Models
          </CardTitle>
          <CardDescription>Configure your AI provider, API key, and model preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
                <SelectItem value="custom">Custom LLM Endpoint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              API Key
            </Label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                onPaste={handleApiKeyPaste}
                placeholder={`Enter your ${provider} API key`}
                className={keyLocked ? 'pr-20 opacity-60 cursor-not-allowed' : 'pr-20'}
                disabled={keyLocked}
              />
              {!keyLocked && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-9 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                  title={showApiKey ? 'Hide key' : 'Reveal key'}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}
              <Button
                type="button"
                variant={keyLocked ? 'default' : 'ghost'}
                size="sm"
                className={`absolute right-0 top-0 h-full px-3 ${keyLocked ? 'rounded-l-none' : ''}`}
                onClick={handleLockClick}
                title={
                  keyLocked
                    ? 'Triple-click to unlock with your 7-digit one-time password'
                    : 'Lock API key'
                }
              >
                {keyLocked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
              </Button>
            </div>
            {lockMessage && keyLocked && (
              <p className="text-xs font-semibold flex items-center gap-1 text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                {lockMessage}
              </p>
            )}
            {lockMessage && !keyLocked && (
              <p className="text-xs font-semibold flex items-center gap-1 text-red-400">
                <AlertCircle className="h-3 w-3" />
                {lockMessage}
              </p>
            )}
            <div className="flex items-center gap-2">
              {apiKeyValid === true && (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Valid Key
                </Badge>
              )}
              {apiKeyValid === false && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Invalid Key
                </Badge>
              )}
              {apiKey.length === 0 && (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  API Not Provided
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            {provider === 'custom' ? (
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Enter custom model name"
              />
            ) : (
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {(PROVIDER_MODELS[provider] ?? []).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {provider === 'custom' && (
            <div className="space-y-2">
              <Label>Custom Endpoint URL</Label>
              <Input
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://your-api-endpoint.com/v1"
              />
            </div>
          )}

          <div className="flex justify-end items-center gap-2">
            {aiSaved && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </span>
            )}
            <Button onClick={handleSaveAiSettings} disabled={!hasUnsavedAi || savingAi}>
              {savingAi ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {savingAi ? 'Saving...' : 'Save AI Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* One-Time Password dialog for unlocking the API key */}
      <Dialog open={otpDialogOpen} onOpenChange={(open) => (open ? openOtpDialog() : closeOtpDialog())}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Unlock API Key
            </DialogTitle>
            <DialogDescription>
              Enter the 7-digit one-time password shown below to unlock and edit the API key.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {otpError && (
              <p
                className={`text-xs font-medium flex items-center gap-1.5 rounded-md border px-3 py-2 ${
                  otpError.includes('generated')
                    ? 'border-green-500/40 bg-green-500/10 text-green-400'
                    : 'border-red-500/40 bg-red-500/10 text-red-400'
                }`}
              >
                {otpError.includes('generated') ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {otpError}
              </p>
            )}

            <div className="space-y-3">
              <Label htmlFor="otp-input">One-Time Password (7 digits)</Label>

              {/* Freshly generated, single-use code */}
              <div className="rounded-md border bg-muted/40 p-3 text-center">
                {otpExpired ? (
                  <p className="text-xs text-red-400">
                    This code has expired. Generate a new one below.
                  </p>
                ) : (
                  <p className="text-3xl font-mono font-bold tracking-[0.3em] text-primary">
                    {otpCode || '•••••••'}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Valid for {otpCountdown}s • single use only
                </p>
              </div>

              <Input
                id="otp-input"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={7}
                placeholder="•••••••"
                disabled={otpExpired}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 7))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleOtpSubmit()
                }}
              />

              <div className="flex justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={handleOtpResend}>
                  Generate new
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={closeOtpDialog}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleOtpSubmit} disabled={otpExpired}>
                    Unlock
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                The code changes every time you unlock, so a used code can never be reused.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Themes */}
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
                onClick={() => handleThemeChange('light')}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs">Light</span>
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => handleThemeChange('dark')}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs">Dark</span>
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => handleThemeChange('system')}
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
                  onClick={() => handleColorSchemeChange(key)}
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
        </CardContent>
      </Card>
    </div>
  )
}
