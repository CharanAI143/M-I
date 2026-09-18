// Shared IPC contract between the Electron main process, the preload bridge,
// and the renderer. Types here are intentionally dependency-free so they can be
// imported from any process without pulling in Electron or React modules.

export type AlarmPlatform = 'codechef' | 'leetcode' | 'codeforces'

export interface AlarmConfig {
  enabled: boolean
  remindMinutes: number
  platform: AlarmPlatform
}

export interface AIGeneratePayload {
  provider: string
  apiKey: string
  model: string
  systemPrompt: string
  userPrompt: string
  customEndpoint?: string
  temperature?: number
  maxTokens?: number
}

export interface PdfSaveRequest {
  suggestedName?: string
  html?: string
}

export type PdfSaveResult =
  | { saved: true; filePath: string }
  | { saved: false; canceled: true }

export type DbSaveResult = { ok: true } | { ok: false; error: string }

export interface YtCheckResult {
  available: boolean
  reason?: string
}

export interface LoginResult {
  enabled: boolean
}

// Maps every ipcMain.handle channel to its request/response shapes.
// A new channel should be added here so all three layers stay in sync.
export interface IpcChannels {
  'course:fetch:text': { req: string; res: string }
  'stats:fetch-text': { req: string; res: string }
  'yt:check': { req: string; res: YtCheckResult }
  'notes:save-pdf': { req: PdfSaveRequest; res: PdfSaveResult }
  'ai:secure-store': { req: string; res: { ok: true } }
  'ai:secure-get': { req: void; res: string }
  'ai:secure-delete': { req: void; res: { ok: true } }
  'ai:generate': { req: AIGeneratePayload; res: string }
  'db:save': { req: string; res: DbSaveResult }
  'db:load': { req: void; res: string | null }
  'db:reset': { req: void; res: DbSaveResult }
  'alarm:set': { req: AlarmConfig; res: AlarmConfig }
  'alarm:get': { req: void; res: AlarmConfig }
  'app:get-login': { req: void; res: LoginResult }
  'app:set-login': { req: boolean; res: LoginResult }
}

export type IpcChannelName = keyof IpcChannels

// Main → renderer push channel (separate from the invoke channels above).
export const ALARM_CHANGED_EVENT = 'alarm:changed'