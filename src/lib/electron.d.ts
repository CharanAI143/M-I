import type { AlarmConfig, AIGeneratePayload, IpcChannels } from '../types/ipc'

declare module '*.wasm?url' {
  const src: string
  export default src
}

declare module 'sql.js/dist/sql-wasm.wasm?url' {
  const src: string
  export default src
}

declare global {
  interface Window {
    electron: any
    secure?: {
      storeApiKey: (apiKey: string) => Promise<IpcChannels['ai:secure-store']['res']>
      getApiKey: () => Promise<IpcChannels['ai:secure-get']['res']>
      deleteApiKey: () => Promise<IpcChannels['ai:secure-delete']['res']>
      generateAI: (payload: AIGeneratePayload) => Promise<IpcChannels['ai:generate']['res']>
    }
    alarm?: {
      set: (config: AlarmConfig) => Promise<IpcChannels['alarm:set']['res']>
      get: () => Promise<IpcChannels['alarm:get']['res']>
      onChanged: (callback: (config: AlarmConfig) => void) => () => void
    }
    app?: {
      getLaunchAtLogin: () => Promise<IpcChannels['app:get-login']['res']>
      setLaunchAtLogin: (enabled: boolean) => Promise<IpcChannels['app:set-login']['res']>
    }
  }
}

export {}