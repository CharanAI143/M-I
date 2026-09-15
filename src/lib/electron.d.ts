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
      storeApiKey: (apiKey: string) => Promise<unknown>
      getApiKey: () => Promise<string>
      deleteApiKey: () => Promise<unknown>
      generateAI: (payload: {
        provider: string
        apiKey: string
        model: string
        systemPrompt: string
        userPrompt: string
        customEndpoint?: string
        temperature?: number
        maxTokens?: number
      }) => Promise<string>
    }
    alarm?: {
      set: (config: {
        enabled: boolean
        remindMinutes: number
        platform: 'codechef' | 'leetcode' | 'codeforces'
      }) => Promise<unknown>
      get: () => Promise<{
        enabled: boolean
        remindMinutes: number
        platform: 'codechef' | 'leetcode' | 'codeforces'
      }>
      onChanged: (
        callback: (config: {
          enabled: boolean
          remindMinutes: number
          platform: 'codechef' | 'leetcode' | 'codeforces'
        }) => void
      ) => () => void
    }
    app?: {
      getLaunchAtLogin: () => Promise<{ enabled: boolean }>
      setLaunchAtLogin: (enabled: boolean) => Promise<{ enabled: boolean }>
    }
  }
}

export {}
