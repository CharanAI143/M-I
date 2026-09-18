import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store'
import { dbStore } from '@/lib/db'
import { secureStoreApiKey } from '@/lib/secure'
import type { AISettings } from '@/lib/types'
import { PROVIDER_MODELS } from './settings-constants'

// localStorage key that remembers whether the API-key field is locked.
const LOCK_STORAGE_KEY = 'mi_api_key_locked'

/**
 * Manages all local AI-settings UI state (provider, API key, model, lock, OTP).
 * The hook owns every field that the original Settings component used to own so
 * that the presentational AiSettingsCard can stay purely props-driven.
 */
export function useAiSettings({
  aiSettings,
  aiLoaded,
  syncFrequency,
}: {
  aiSettings: AISettings | undefined
  aiLoaded: boolean
  syncFrequency: number
}) {
  const updateSettings = useAppStore((s) => s.updateSettings)
  const syncRef = useRef(syncFrequency)
  syncRef.current = syncFrequency

  const [provider, setProvider] = useState<string>(aiSettings?.provider ?? 'openai')
  const [apiKey, setApiKey] = useState<string>(aiSettings?.apiKey ?? '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null)
  const [model, setModel] = useState<string>(aiSettings?.model ?? '')
  const [customEndpoint, setCustomEndpoint] = useState<string>(aiSettings?.customEndpoint ?? '')
  const [hasUnsavedAi, setHasUnsavedAi] = useState(false)
  const [savingAi, setSavingAi] = useState(false)
  const [aiSaved, setAiSaved] = useState(false)

  // The persisted lock flag is the source of truth. It is deliberately NOT
  // gated on `aiSettings.apiKey` here: the key loads asynchronously from the
  // main process, so at mount it is still empty and gating on it would drop a
  // lock the user had explicitly set. Reconciliation with the real key happens
  // once the settings finish hydrating (see the effect below).
  const [keyLocked, setKeyLocked] = useState<boolean>(
    () => localStorage.getItem(LOCK_STORAGE_KEY) === '1'
  )
  const [lockMessage, setLockMessage] = useState<string>(
    () => (localStorage.getItem(LOCK_STORAGE_KEY) === '1' ? 'API KEY Locked' : '')
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

  useEffect(() => {
    const models = PROVIDER_MODELS[provider] ?? []
    if (models.length > 0 && !models.includes(model)) {
      setModel(models[0])
      setHasUnsavedAi(true)
    }
  }, [provider, model])

  // Sync local AI fields whenever persisted settings load/change
  // (prevents reverting to the default provider after app restart)
  useEffect(() => {
    if (aiSettings?.provider) setProvider(aiSettings.provider)
    if (aiSettings?.model) setModel(aiSettings.model)
    if (aiSettings?.apiKey) setApiKey(aiSettings.apiKey)
    setCustomEndpoint(aiSettings?.customEndpoint ?? '')
  }, [aiSettings])

  useEffect(() => {
    setHasUnsavedAi(true)
  }, [apiKey, model, customEndpoint])

  // Drop the lock without showing the "Unlocked!" confirmation — used for
  // programmatic resets where no user action prompted the change.
  function clearLockSilently() {
    setKeyLocked(false)
    setLockMessage('')
    localStorage.setItem(LOCK_STORAGE_KEY, '0')
  }

  // A key counts as present if it is either hydrated from the store or currently
  // in the input (the latter covers a key that has been typed but not yet saved).
  // Checking both avoids a race where this effect runs before the local `apiKey`
  // state has sync'd from freshly hydrated settings.
  const hasKey = Boolean(apiKey || aiSettings?.apiKey)

  // Reconcile the persisted lock with whether a key is actually present.
  // This runs only after the settings have hydrated (`aiLoaded`), because before
  // that an empty `apiKey` merely means "not loaded yet" — treating it as "no
  // key" is what used to wipe the lock flag on every startup. A lock with no key
  // is meaningless, so it is cleared; a lock with a key is (re-)applied.
  useEffect(() => {
    if (!aiLoaded) return
    const flagged = localStorage.getItem(LOCK_STORAGE_KEY) === '1'
    if (!hasKey) {
      if (keyLocked || flagged) clearLockSilently()
    } else if (flagged && !keyLocked) {
      setKeyLocked(true)
      setLockMessage('API KEY Locked')
    }
  }, [aiLoaded, hasKey, keyLocked])

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
      updateSettings({ ai, syncInterval: syncRef.current })
      await secureStoreApiKey(apiKey)
      // Deleting the key makes the lock meaningless; clear it so the field is
      // usable again even if the settings were hydrated before this save.
      if (!apiKey) clearLockSilently()
      // Remove any legacy plaintext key from the renderer database
      await dbStore.delete('ai_api_key')
      // ai_provider / ai_model / ai_custom_endpoint are persisted centrally by
      // the store subscriber whenever settings change.
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
    localStorage.setItem(LOCK_STORAGE_KEY, locked ? '1' : '0')
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

  function resetAiState() {
    setProvider('openai')
    setApiKey('')
    setModel('gpt-4o')
    setCustomEndpoint('')
    setApiKeyValid(null)
    setHasUnsavedAi(false)
    clearLockSilently()
  }

  return {
    provider,
    setProvider,
    apiKey,
    showApiKey,
    setShowApiKey,
    apiKeyValid,
    model,
    setModel,
    customEndpoint,
    setCustomEndpoint,
    hasUnsavedAi,
    savingAi,
    aiSaved,
    keyLocked,
    lockMessage,
    otpDialogOpen,
    setOtpDialogOpen,
    otpError,
    otpExpired,
    otpCode,
    otpCountdown,
    otpInput,
    setOtpInput,
    handleApiKeyChange,
    handleApiKeyPaste,
    handleLockClick,
    handleSaveAiSettings,
    handleOtpSubmit,
    handleOtpResend,
    openOtpDialog,
    closeOtpDialog,
    resetAiState,
  }
}