import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Secure bridge — only exposes the minimal AI key operations needed by the UI.
// The raw key travels over IPC but is stored/processed in the main process.
const secureAPI = {
  storeApiKey: (apiKey: string) => ipcRenderer.invoke('ai:secure-store', apiKey),
  getApiKey: () => ipcRenderer.invoke('ai:secure-get'),
  deleteApiKey: () => ipcRenderer.invoke('ai:secure-delete'),
  generateAI: (payload: {
    provider: string
    apiKey: string
    model: string
    systemPrompt: string
    userPrompt: string
    customEndpoint?: string
    temperature?: number
    maxTokens?: number
  }) => ipcRenderer.invoke('ai:generate', payload),
}

const alarmAPI = {
  set: (config: {
    enabled: boolean
    remindMinutes: number
    platform: 'codechef' | 'leetcode' | 'codeforces'
  }) => ipcRenderer.invoke('alarm:set', config),
  get: () => ipcRenderer.invoke('alarm:get'),
  onChanged: (callback: (config: unknown) => void) => {
    const listener = (_event: unknown, config: unknown) => callback(config)
    ipcRenderer.on('alarm:changed', listener)
    return () => ipcRenderer.removeListener('alarm:changed', listener)
  },
}

const appAPI = {
  getLaunchAtLogin: () => ipcRenderer.invoke('app:get-login'),
  setLaunchAtLogin: (enabled: boolean) => ipcRenderer.invoke('app:set-login', enabled),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('secure', secureAPI)
    contextBridge.exposeInMainWorld('alarm', alarmAPI)
    contextBridge.exposeInMainWorld('app', appAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.secure = secureAPI
  // @ts-ignore
  window.alarm = alarmAPI
  // @ts-ignore
  window.app = appAPI
}
