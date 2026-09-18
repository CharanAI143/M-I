import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { AlarmConfig, AIGeneratePayload, IpcChannels, IpcChannelName } from '../src/types/ipc'
import { ALARM_CHANGED_EVENT } from '../src/types/ipc'

function invoke<C extends IpcChannelName>(
  channel: C,
  req: IpcChannels[C]['req']
): Promise<IpcChannels[C]['res']> {
  return ipcRenderer.invoke(channel, req)
}

// Secure bridge — only exposes the minimal AI key operations needed by the UI.
// The raw key travels over IPC but is stored/processed in the main process.
const secureAPI = {
  storeApiKey: (apiKey: string) => invoke('ai:secure-store', apiKey),
  getApiKey: () => invoke('ai:secure-get', undefined),
  deleteApiKey: () => invoke('ai:secure-delete', undefined),
  generateAI: (payload: AIGeneratePayload) => invoke('ai:generate', payload),
}

const alarmAPI = {
  set: (config: AlarmConfig) => invoke('alarm:set', config),
  get: () => invoke('alarm:get', undefined),
  onChanged: (callback: (config: AlarmConfig) => void) => {
    const listener = (_event: unknown, config: AlarmConfig) => callback(config)
    ipcRenderer.on(ALARM_CHANGED_EVENT, listener)
    return () => ipcRenderer.removeListener(ALARM_CHANGED_EVENT, listener)
  },
}

const appAPI = {
  getLaunchAtLogin: () => invoke('app:get-login', undefined),
  setLaunchAtLogin: (enabled: boolean) => invoke('app:set-login', enabled),
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