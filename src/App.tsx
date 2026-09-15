import { useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import Dashboard from '@/modules/Dashboard'
import Profiles from '@/modules/Profiles'
import Notes from '@/modules/Notes'
import Roadmap from '@/modules/Roadmap'
import Interview from '@/modules/Interview'
import Planner from '@/modules/Planner'
import Settings from '@/modules/Settings'
import Sql from '@/modules/Sql'
import { useAppStore, dbApi, dbStore } from '@/store'
import { syncAllPlatforms } from '@/lib/api'
import { secureGetApiKey } from '@/lib/secure'
import { getToday } from '@/lib/utils'

function App() {
  const { activeModule, settings, setProfiles, setActivities, setLastSynced, setIsSyncing, setDailyTarget, setQuestionBank, updateSettings, setClockWarning } = useAppStore()

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
              provider: (savedProvider as any) ?? settings.ai.provider,
              model: savedModel ?? settings.ai.model,
              customEndpoint: savedCustomEndpoint ?? settings.ai.customEndpoint,
            },
          })
        }

        // Load persisted SQL mode preference.
        const savedSqlMode = await dbStore.get('sql_mode')
        if (savedSqlMode != null) {
          updateSettings({ sqlMode: savedSqlMode === 'true' })
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
  }, [])

  // Background sync service - every 15 minutes
  useEffect(() => {
    if (!settings.autoSync) return

    const syncInterval = (settings.syncInterval || 15) * 60 * 1000

    const interval = setInterval(async () => {
      try {
        setIsSyncing(true)
        const profiles = await dbApi.loadProfiles()
        const platformProfiles = profiles
          .filter(p => p.username)
          .map(p => ({ platform: p.platform as any, username: p.username }))
        if (platformProfiles.length > 0) {
          await syncAllPlatforms(platformProfiles)
        }
        const updated = await dbApi.loadProfiles()
        setProfiles(updated)
        const activities = await dbApi.loadActivities()
        setActivities(activities)
        setLastSynced(new Date().toISOString())
      } catch (e) {
        console.error('Background sync failed:', e)
      } finally {
        setIsSyncing(false)
      }
    }, syncInterval)

    return () => clearInterval(interval)
  }, [settings.autoSync, settings.syncInterval])

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />
      case 'profiles': return <Profiles />
      case 'notes': return <Notes />
      case 'roadmap': return <Roadmap />
      case 'interview': return <Interview />
      case 'sql': return <Sql />
      case 'planner': return <Planner />
      case 'settings': return <Settings />
      default: return <Dashboard />
    }
  }

  return (
    <Layout>
      {renderModule()}
    </Layout>
  )
}

export default App
