import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { resetAllData } from '@/lib/db'
import { secureDeleteApiKey } from '@/lib/secure'
import { Separator } from '@/components/ui/separator'
import { applyTheme } from '@/lib/theme'
import { useAiSettings } from '@/components/settings/useAiSettings'
import { SyncSettingsCard } from '@/components/settings/SyncSettingsCard'
import { ContestRemindersCard } from '@/components/settings/ContestRemindersCard'
import { DashboardCardsCard } from '@/components/settings/DashboardCardsCard'
import { SqlModeCard } from '@/components/settings/SqlModeCard'
import { AiSettingsCard } from '@/components/settings/AiSettingsCard'
import { ThemesCard } from '@/components/settings/ThemesCard'
import { COLOR_PRESETS } from '@/components/settings/settings-constants'
import type { PosterCategory } from '@/lib/types'

export default function Settings() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const lastSynced = useAppStore((s) => s.lastSynced)

  const [syncFrequency, setSyncFrequency] = useState<number>(settings.syncInterval ?? 15)
  const [launchAtLogin, setLaunchAtLogin] = useState(false)

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [colorScheme, setColorScheme] = useState<string>('blue')

  const ai = useAiSettings({ aiSettings: settings.ai, syncFrequency })

  // Load the current "open at login" state from the main process.
  useEffect(() => {
    if (!window.app?.getLaunchAtLogin) return
    window.app
      .getLaunchAtLogin()
      .then((r) => setLaunchAtLogin(r.enabled))
      .catch(() => {})
  }, [])

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

  async function handleResetAll() {
    await resetAllData()
    await secureDeleteApiKey()
    useAppStore.getState().resetStore()
    ai.resetAiState()
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your application preferences and configurations.</p>
      </div>

      <Separator />

      {/* Sync Settings */}
      <SyncSettingsCard
        autoSync={settings?.autoSync ?? false}
        launchAtLogin={launchAtLogin}
        syncFrequency={syncFrequency}
        lastSynced={lastSynced}
        onToggleAutoSync={(checked) => updateSettings({ autoSync: checked })}
        onToggleLaunchAtLogin={(checked) => {
          setLaunchAtLogin(checked)
          window.app?.setLaunchAtLogin(checked).catch(() => {})
        }}
        onSyncFrequencyChange={(minutes) => {
          setSyncFrequency(minutes)
          updateSettings({ syncInterval: minutes })
        }}
        onReset={handleResetAll}
      />

      {/* Contest Reminders */}
      <ContestRemindersCard
        value={settings?.contestRemindMinutes ?? 15}
        onChange={(minutes) => {
          updateSettings({ contestRemindMinutes: minutes })
        }}
      />

      {/* Dashboard Cards */}
      <DashboardCardsCard
        animePoster={settings?.animePoster ?? true}
        posterCategory={(settings?.posterCategory ?? 'anime') as PosterCategory}
        onTogglePoster={(checked) => {
          updateSettings({ animePoster: checked })
        }}
        onCategoryChange={(cat) => {
          updateSettings({ posterCategory: cat })
        }}
      />

      {/* SQL Mode */}
      <SqlModeCard
        enabled={settings?.sqlMode ?? false}
        onToggle={(checked) => {
          updateSettings({ sqlMode: checked })
        }}
      />

      {/* Credits & AI Models */}
      <AiSettingsCard
        provider={ai.provider}
        setProvider={ai.setProvider}
        apiKey={ai.apiKey}
        showApiKey={ai.showApiKey}
        setShowApiKey={ai.setShowApiKey}
        apiKeyValid={ai.apiKeyValid}
        model={ai.model}
        setModel={ai.setModel}
        customEndpoint={ai.customEndpoint}
        setCustomEndpoint={ai.setCustomEndpoint}
        hasUnsavedAi={ai.hasUnsavedAi}
        savingAi={ai.savingAi}
        aiSaved={ai.aiSaved}
        keyLocked={ai.keyLocked}
        lockMessage={ai.lockMessage}
        otpDialogOpen={ai.otpDialogOpen}
        otpError={ai.otpError}
        otpExpired={ai.otpExpired}
        otpCode={ai.otpCode}
        otpCountdown={ai.otpCountdown}
        otpInput={ai.otpInput}
        setOtpInput={ai.setOtpInput}
        onApiKeyChange={ai.handleApiKeyChange}
        onApiKeyPaste={ai.handleApiKeyPaste}
        onLockClick={ai.handleLockClick}
        onSave={ai.handleSaveAiSettings}
        onOtpSubmit={ai.handleOtpSubmit}
        onOtpResend={ai.handleOtpResend}
        openOtpDialog={ai.openOtpDialog}
        closeOtpDialog={ai.closeOtpDialog}
      />

      {/* Themes */}
      <ThemesCard
        theme={theme}
        colorScheme={colorScheme}
        onThemeChange={handleThemeChange}
        onColorSchemeChange={handleColorSchemeChange}
      />
    </div>
  )
}