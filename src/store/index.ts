import { create } from 'zustand'
import type { Profile, ActivityLog, DailyTarget, Note, AppSettings, MockQuestion, Platform } from '@/lib/types'
import { loadTagCounts } from '@/lib/badges'
import { dbApi, dbStore } from '@/lib/db'
import { syncAllPlatforms } from '@/services/sync-coordinator'

export const defaultSettings: AppSettings = {
  autoSync: true,
  syncInterval: 15,
  theme: 'dark',
  contestRemindMinutes: 15,
  sqlMode: false,
  animePoster: true,
  posterCategory: 'anime',
  ai: {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o',
    customEndpoint: '',
  },
}

function createInitialState() {
  return {
    profiles: [],
    activities: [],
    dailyTarget: null,
    notes: [],
    questionBank: [],
    settings: defaultSettings,
    lastSynced: null,
    isSyncing: false,
    tagCounts: loadTagCounts(),
    clockWarning: null,
  }
}

interface AppState {
  profiles: Profile[]
  activities: ActivityLog[]
  dailyTarget: DailyTarget | null
  notes: Note[]
  questionBank: MockQuestion[]
  settings: AppSettings
  lastSynced: string | null
  isSyncing: boolean
  tagCounts: Record<string, number>
  clockWarning: string | null

  setProfiles: (profiles: Profile[]) => void
  setActivities: (activities: ActivityLog[]) => void
  setDailyTarget: (target: DailyTarget | null) => void
  setNotes: (notes: Note[]) => void
  setQuestionBank: (bank: MockQuestion[]) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  setLastSynced: (time: string) => void
  setIsSyncing: (syncing: boolean) => void
  setTagCounts: (counts: Record<string, number>) => void
  setClockWarning: (warning: string | null) => void
  resetStore: () => void
  syncNow: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  ...createInitialState(),

  setProfiles: (profiles) => set({ profiles }),
  setActivities: (activities) => set({ activities }),
  setDailyTarget: (dailyTarget) => set({ dailyTarget }),
  setNotes: (notes) => set({ notes }),
  setQuestionBank: (questionBank) => set({ questionBank }),
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  setLastSynced: (lastSynced) => set({ lastSynced }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setTagCounts: (tagCounts) => set({ tagCounts }),
  setClockWarning: (clockWarning) => set({ clockWarning }),
  resetStore: () => set(createInitialState()),

  // Single source of truth for a manual / interval sync pass. Replaces the
  // duplicated sync loops that used to live in App (background) and Header
  // (Sync Now button).
  syncNow: async () => {
    if (get().isSyncing) return
    set({ isSyncing: true })
    try {
      const profiles = await dbApi.loadProfiles()
      const platformProfiles = profiles
        .filter((p) => p.username)
        .map((p) => ({ platform: p.platform as Platform, username: p.username }))
      if (platformProfiles.length > 0) {
        await syncAllPlatforms(platformProfiles)
      }
      const updated = await dbApi.loadProfiles()
      const activities = await dbApi.loadActivities()
      set({ profiles: updated, activities, lastSynced: new Date().toISOString() })
    } catch (e) {
      console.error('Background sync failed:', e)
    } finally {
      set({ isSyncing: false })
    }
  },
}))

// Central settings persistence. Any `updateSettings` write is mirrored to the
// on-disk key/value store so preferences survive restarts (including autoSync
// / syncInterval, which previously were never persisted). The API key is NOT
// written here — it is stored encrypted in the main process via safeStorage.
useAppStore.subscribe((state, prev) => {
  if (state.settings === prev.settings) return
  const s = state.settings
  const persist = async () => {
    dbStore.set('auto_sync', String(s.autoSync))
    dbStore.set('sync_interval', String(s.syncInterval))
    dbStore.set('contest_remind_minutes', String(s.contestRemindMinutes))
    dbStore.set('sql_mode', String(s.sqlMode))
    dbStore.set('anime_poster', String(s.animePoster))
    dbStore.set('poster_category', s.posterCategory)
    dbStore.set('ai_provider', s.ai.provider)
    dbStore.set('ai_model', s.ai.model)
    dbStore.set('ai_custom_endpoint', s.ai.customEndpoint)
  }
  void persist()
})