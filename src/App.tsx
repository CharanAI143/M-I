import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Dashboard from '@/modules/Dashboard'
import Profiles from '@/modules/Profiles'
import Notes from '@/modules/Notes'
import Roadmap from '@/modules/Roadmap'
import Interview from '@/modules/Interview'
import Planner from '@/modules/Planner'
import Settings from '@/modules/Settings'
import Sql from '@/modules/Sql'
import { useAppStore } from '@/store'
import { dbApi, dbStore } from '@/lib/db'
import { secureGetApiKey } from '@/lib/secure'
import { getToday } from '@/lib/utils'
import type { AISettings } from '@/lib/types'
import { ROUTES } from '@/lib/routes'

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  )
}

function AppContent() {
  const { settings, setProfiles, setActivities, setDailyTarget, setQuestionBank, updateSettings, setAiLoaded, setClockWarning } = useAppStore()

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        // One-time migration: remove inflated sync activities that were
        // previously logged on every background sync. Only run once.
        if (!localStorage.getItem('mi-prune-sync-done')) {
          await dbApi.pruneSyncActivities()
          localStorage.setItem('mi-prune-sync-done', '1')
        }

        const profiles = await dbApi.loadProfiles()
        setProfiles(profiles)

        const activities = await dbApi.loadActivities()
        setActivities(activities)

        const target = await dbApi.ensureDailyTarget()
        setDailyTarget(target)

        // Clock anomaly check: activity should never be dated after today (that
        // would mean the system clock was set forward and then corrected, or a
        // future-dated row exists). Also surface the one-time note written by
        // the db write-guard when it clamped itself after a backward clock jump.
        const todayStr = getToday()
        const newestDate = activities.reduce((m, a) => (a.date > m ? a.date : m), '')
        if (newestDate > todayStr) {
          setClockWarning(
            `Some activity is dated ${newestDate}, which is after today (${todayStr}). The system clock may have been changed — verify your date & time settings so streaks stay accurate.`
          )
        } else {
          const guardNote = await dbStore.get('mi_clock_guard_note')
          if (guardNote != null) {
            setClockWarning(String(guardNote))
            await dbStore.delete('mi_clock_guard_note')
          }
        }

        // Load the company question bank from the database.
        const bank = await dbApi.loadQuestions()
        setQuestionBank(bank)

        // Load persisted AI settings. The API key is stored encrypted in the
        // main process (safeStorage); provider/model/endpoint live in the DB.
        const [savedApiKey, savedProvider, savedModel, savedCustomEndpoint] = await Promise.all([
          secureGetApiKey(),
          dbStore.get('ai_provider'),
          dbStore.get('ai_model'),
          dbStore.get('ai_custom_endpoint'),
        ])
        if (
          savedApiKey != null ||
          savedProvider != null ||
          savedModel != null ||
          savedCustomEndpoint != null
        ) {
          updateSettings({
            ai: {
              ...settings.ai,
              apiKey: savedApiKey || settings.ai.apiKey,
              provider: (savedProvider as AISettings['provider']) ?? settings.ai.provider,
              model: savedModel ?? settings.ai.model,
              customEndpoint: savedCustomEndpoint ?? settings.ai.customEndpoint,
            },
          })
        }
        // Signal that the (asynchronously loaded) API key has been hydrated.
        // The Settings lock relies on this to tell "no key stored" apart from
        // "key not loaded yet" so a persisted lock is never wiped on startup.
        setAiLoaded(true)

        // Load persisted SQL mode preference.
        const savedSqlMode = await dbStore.get('sql_mode')
        if (savedSqlMode != null) {
          updateSettings({ sqlMode: savedSqlMode === 'true' })
        }

        // Load persisted auto-sync / sync interval preferences.
        const [savedAutoSync, savedSyncInterval] = await Promise.all([
          dbStore.get('auto_sync'),
          dbStore.get('sync_interval'),
        ])
        if (savedAutoSync != null) {
          updateSettings({ autoSync: savedAutoSync === 'true' })
        }
        if (savedSyncInterval != null) {
          const intervalVal = Number(savedSyncInterval)
          if (Number.isFinite(intervalVal) && intervalVal > 0) {
            updateSettings({ syncInterval: intervalVal })
          }
        }

        // Load persisted poster gallery preference (Marvel / DC / Anime).
        const savedPosterCategory = await dbStore.get('poster_category')
        if (
          savedPosterCategory === 'all' ||
          savedPosterCategory === 'marvel' ||
          savedPosterCategory === 'dc' ||
          savedPosterCategory === 'anime'
        ) {
          updateSettings({ posterCategory: savedPosterCategory })
        }

        // Load persisted anime quote poster preference.
        const savedAnimePoster = await dbStore.get('anime_poster')
        if (savedAnimePoster != null) {
          updateSettings({ animePoster: savedAnimePoster === 'true' })
        }

        // Load persisted contest reminder lead time.
        const savedRemindMinutes = await dbStore.get('contest_remind_minutes')
        if (savedRemindMinutes != null) {
          const remindVal = Number(savedRemindMinutes)
          if (Number.isFinite(remindVal) && remindVal > 0) {
            updateSettings({ contestRemindMinutes: remindVal })
          }
        }
      } catch (e) {
        console.error('Failed to load initial data:', e)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Background sync service - every 15 minutes
  useEffect(() => {
    if (!settings.autoSync) return

    const syncInterval = (settings.syncInterval || 15) * 60 * 1000

    const interval = setInterval(() => {
      useAppStore.getState().syncNow()
    }, syncInterval)

    return () => clearInterval(interval)
  }, [settings.autoSync, settings.syncInterval])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path={ROUTES.dashboard} element={<Dashboard />} />
        <Route path={ROUTES.profiles} element={<Profiles />} />
        <Route path={ROUTES.notes} element={<Notes />} />
        <Route path={ROUTES.roadmap} element={<Roadmap />} />
        <Route path={ROUTES.interview} element={<Interview />} />
        <Route path={ROUTES.sql} element={<Sql />} />
        <Route path={ROUTES.planner} element={<Planner />} />
        <Route path={ROUTES.settings} element={<Settings />} />
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </Layout>
  )
}
