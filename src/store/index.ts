import { create } from 'zustand'
import type { Profile, ActivityLog, DailyTarget, Course, Note, AppSettings, MockQuestion } from '@/lib/types'
import { loadTagCounts } from '@/lib/badges'

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
    courses: [],
    notes: [],
    questionBank: [],
    settings: defaultSettings,
    lastSynced: null,
    isSyncing: false,
    activeModule: 'dashboard',
    tagCounts: loadTagCounts(),
    clockWarning: null,
  }
}

interface AppState {
  profiles: Profile[]
  activities: ActivityLog[]
  dailyTarget: DailyTarget | null
  courses: Course[]
  notes: Note[]
  questionBank: MockQuestion[]
  settings: AppSettings
  lastSynced: string | null
  isSyncing: boolean
  activeModule: string
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
  setActiveModule: (module: string) => void
  setTagCounts: (counts: Record<string, number>) => void
  setClockWarning: (warning: string | null) => void
  resetStore: () => void
}

export const useAppStore = create<AppState>((set) => ({
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
  setActiveModule: (activeModule) => set({ activeModule }),
  setTagCounts: (tagCounts) => set({ tagCounts }),
  setClockWarning: (clockWarning) => set({ clockWarning }),
  resetStore: () => set(createInitialState()),
}))

// Database API helpers (backed by sql.js/WASM in the renderer)
export { dbApi, dbStore, resetAllData, resetDatabase } from '@/lib/db'
