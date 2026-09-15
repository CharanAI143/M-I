import { app, shell, BrowserWindow, ipcMain, net, dialog, safeStorage, screen, Tray, Menu, nativeImage } from 'electron'
import { join, dirname, resolve } from 'path'
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs'
import { writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { alarmManager, type AlarmPlatform } from './alarm'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Prevent multiple instances of the app from running simultaneously.
// Without this, two instances would each get their own renderer localStorage,
// causing data written by one instance to be invisible to the other.
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // If a second instance tries to open, focus the existing window instead.
    showMainWindow()
  })
}

let mainWindow: BrowserWindow | null = null
let isQuitting = false
let tray: Tray | null = null

const TRAY_ICON = join(__dirname, '../build/icon.png')

function showMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow()
    return
  }
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

// ── Window bounds persistence ──────────────────────────────────────────────
// The window's size and position (and maximized state) are saved across
// restarts so users can keep the window exactly where they like it. The minimum
// size is deliberately small so the window can be shrunk below the screen size.
const DEFAULT_WIN_WIDTH = 1400
const DEFAULT_WIN_HEIGHT = 900
const MIN_WIN_WIDTH = 480
const MIN_WIN_HEIGHT = 320
const WINDOW_STATE_FILE = join(app.getPath('userData'), 'window-state.json')
const MAX_FETCH_BYTES = 10 * 1024 * 1024

type WindowState = {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized?: boolean
}

function loadWindowState(): WindowState | null {
  try {
    if (!existsSync(WINDOW_STATE_FILE)) return null
    const saved = JSON.parse(readFileSync(WINDOW_STATE_FILE, 'utf-8')) as Partial<WindowState>
    const clamp = (v: unknown, fallback: number, min: number) =>
      typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(v, 4096)) : fallback
    const state: WindowState = {
      width: clamp(saved.width, DEFAULT_WIN_WIDTH, MIN_WIN_WIDTH),
      height: clamp(saved.height, DEFAULT_WIN_HEIGHT, MIN_WIN_HEIGHT),
      isMaximized: saved.isMaximized === true,
    }
    if (typeof saved.x === 'number' && typeof saved.y === 'number') {
      state.x = saved.x
      state.y = saved.y
    }
    return state
  } catch {
    return null
  }
}

function createWindow(): void {
  const iconPath = join(__dirname, '../build/icon.png')

  const saved = loadWindowState()
  let x: number | undefined
  let y: number | undefined
  if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
    const sx = saved.x
    const sy = saved.y
    const onScreen = screen.getAllDisplays().some((d) => {
      const wa = d.workArea
      return (
        sx < wa.x + wa.width &&
        sx + saved.width > wa.x &&
        sy < wa.y + wa.height &&
        sy + saved.height > wa.y
      )
    })
    if (onScreen) {
      x = sx
      y = sy
    }
  }

  mainWindow = new BrowserWindow({
    width: saved?.width ?? DEFAULT_WIN_WIDTH,
    height: saved?.height ?? DEFAULT_WIN_HEIGHT,
    minWidth: MIN_WIN_WIDTH,
    minHeight: MIN_WIN_HEIGHT,
    x,
    y,
    show: false,
    autoHideMenuBar: true,
    icon: existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  })

  // Track the window's normal (non-maximized) bounds and persist on change or
  // close so the size/position are restored on the next launch.
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  const persistBounds = () => {
    if (mainWindow.isDestroyed()) return
    const bounds = mainWindow.getNormalBounds()
    const payload = { ...bounds, isMaximized: mainWindow.isMaximized() }
    try {
      writeFileSync(WINDOW_STATE_FILE, JSON.stringify(payload))
    } catch {}
  }
  const schedulePersist = () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(persistBounds, 400)
  }
  mainWindow.on('resize', schedulePersist)
  mainWindow.on('move', schedulePersist)
  mainWindow.on('close', (event) => {
    if (saveTimer) clearTimeout(saveTimer)
    persistBounds()
    // Close the window -> hide to tray instead of quitting, so the contest
    // alarm keeps running in the background. Quitting is only allowed via the
    // tray menu or app.quit() (see before-quit below).
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (saved?.isMaximized) mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(resolve(__dirname, '../dist/index.html'))
  }
}

async function fetchBodyTextLimited(response: Response): Promise<string> {
  const text = await response.text()
  if (text.length > MAX_FETCH_BYTES) throw new Error('Response too large')
  return text
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.mi.coding-tracker')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Fetch a remote page/endpoint from the main process.
  // This bypasses renderer CORS so the app can scrape GFG / CodeChef course pages.
  ipcMain.handle('course:fetch:text', async (_event, url: string) => {
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      throw new Error('Invalid URL')
    }
    const response = await net.fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await fetchBodyTextLimited(response)
  })

  // Fetch a stats endpoint (GFG profile API) from the main process.
  // These unofficial APIs don't send CORS headers, so a renderer fetch is
  // blocked — this bypasses it the same way course scraping does.
  ipcMain.handle('stats:fetch-text', async (_event, url: string) => {
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      throw new Error('Invalid URL')
    }
    const response = await net.fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json,text/plain,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await fetchBodyTextLimited(response)
  })

  // Check if a YouTube video is available (returns 200 and contains video player).
  ipcMain.handle('yt:check', async (_event, url: string) => {
    if (typeof url !== 'string' || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url)) {
      return { available: false, reason: 'invalid_url' }
    }
    try {
      const response = await net.fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })
      if (!response.ok) {
        return { available: false, reason: `http_${response.status}` }
      }
      const html = await response.text()
      // A valid video page contains the video player / ytInitialData
      const hasVideo = /ytInitialData|"videoId"|youtube\.com\/embed\/|youtu\.be\//.test(html)
      return { available: hasVideo }
    } catch (error) {
      return { available: false, reason: error instanceof Error ? error.message : 'unknown' }
    }
  })

  // Render the notes HTML to a real PDF (via an offscreen window) and save it.
  ipcMain.handle('notes:save-pdf', async (event, payload: { suggestedName?: string; html?: string }) => {
    const suggestedName =
      typeof payload?.suggestedName === 'string' && payload.suggestedName.trim()
        ? payload.suggestedName
        : 'notes.pdf'
    const html = typeof payload?.html === 'string' ? payload.html : ''
    if (!html) throw new Error('Empty notes content')

    const docWin = new BrowserWindow({
      show: false,
      skipTaskbar: true,
      width: 820,
      height: 1100,
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false,
      },
    })

    try {
      await docWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
      const pdf = await docWin.webContents.printToPDF({
        pageSize: 'A4',
        printBackground: true,
        margins: { top: 0.5, bottom: 0.5, left: 0.6, right: 0.6 },
      })

      const win = BrowserWindow.fromWebContents(event.sender)
      const options: Electron.SaveDialogOptions = {
        title: 'Save Refined Notes as PDF',
        defaultPath: join(app.getPath('documents'), suggestedName),
        filters: [
          { name: 'PDF Document', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      }
      const result = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options)
      if (result.canceled || !result.filePath) return { saved: false, canceled: true }

      await writeFile(result.filePath, pdf)
      return { saved: true, filePath: result.filePath }
    } finally {
      docWin.destroy()
    }
  })

  // ── Secure API key storage (encrypted via OS-level safeStorage) ──────────
  const SECURE_KEY_FILE = join(app.getPath('userData'), 'ai_key.enc')

  ipcMain.handle('ai:secure-store', async (_event, apiKey: string) => {
    if (typeof apiKey !== 'string') throw new Error('API key must be a string')
    if (apiKey && safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(apiKey)
      writeFileSync(SECURE_KEY_FILE, encrypted)
    } else if (apiKey) {
      // Fallback: write raw bytes if encryption unavailable (Linux headless etc.)
      writeFileSync(SECURE_KEY_FILE, Buffer.from(apiKey, 'utf-8'))
    } else {
      // Empty key = clear
      if (existsSync(SECURE_KEY_FILE)) {
        const { unlinkSync } = await import('fs')
        unlinkSync(SECURE_KEY_FILE)
      }
    }
    return { ok: true }
  })

  ipcMain.handle('ai:secure-get', async () => {
    if (!existsSync(SECURE_KEY_FILE)) return ''
    try {
      const buf = readFileSync(SECURE_KEY_FILE)
      if (safeStorage.isEncryptionAvailable()) {
        return safeStorage.decryptString(buf)
      }
      return buf.toString('utf-8')
    } catch {
      return ''
    }
  })

  ipcMain.handle('ai:secure-delete', async () => {
    if (existsSync(SECURE_KEY_FILE)) {
      const { unlinkSync } = await import('fs')
      unlinkSync(SECURE_KEY_FILE)
    }
    return { ok: true }
  })

  // ── Database file persistence ────────────────────────────────────────────
  // The SQLite database (sql.js) is exported to a binary file on disk instead
  // of localStorage.  This avoids the 5 MB localStorage quota, prevents data
  // corruption when two windows/instances try to write simultaneously, and
  // makes the data survive app reinstalls that clear the renderer session.
  const DB_FILE = join(app.getPath('userData'), 'mi-tracker-db.sqlite')

  ipcMain.handle('db:save', async (_event, base64Data: string) => {
    try {
      const buffer = Buffer.from(base64Data, 'base64')
      writeFileSync(DB_FILE, buffer)
      return { ok: true }
    } catch (e) {
      console.error('Failed to save database file:', e)
      return { ok: false, error: String(e) }
    }
  })

  ipcMain.handle('db:load', async () => {
    try {
      if (!existsSync(DB_FILE)) return null
      const buffer = readFileSync(DB_FILE)
      return buffer.toString('base64')
    } catch (e) {
      console.error('Failed to load database file:', e)
      return null
    }
  })

  ipcMain.handle('db:reset', async () => {
    try {
      if (existsSync(DB_FILE)) unlinkSync(DB_FILE)
      return { ok: true }
    } catch (e) {
      console.error('Failed to reset database file:', e)
      return { ok: false, error: String(e) }
    }
  })

  // ── AI proxy: route provider calls through main process so the API key
  //    never touches the renderer bundle. ───────────────────────────────────
  ipcMain.handle(
    'ai:generate',
    async (_event, payload: {
      provider: string
      apiKey: string
      model: string
      systemPrompt: string
      userPrompt: string
      customEndpoint?: string
      temperature?: number
      maxTokens?: number
    }) => {
      const { provider, apiKey, model, systemPrompt, userPrompt, customEndpoint, temperature = 0.7, maxTokens = 4096 } = payload

      const endpoints: Record<string, string> = {
        openai: 'https://api.openai.com/v1/chat/completions',
        anthropic: 'https://api.anthropic.com/v1/messages',
        gemini: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        deepseek: 'https://api.deepseek.com/chat/completions',
        groq: 'https://api.groq.com/openai/v1/chat/completions',
      }
      if (provider === 'custom') {
        const trimmed = (customEndpoint || '').trim().replace(/\/+$/, '')
        endpoints.custom = trimmed.endsWith('/chat/completions')
          ? trimmed
          : `${trimmed || endpoints.openai}/chat/completions`
      }

      let url: string
      let headers: Record<string, string> = { 'Content-Type': 'application/json' }
      let body: string

      if (provider === 'openai' || provider === 'deepseek' || provider === 'groq' || provider === 'custom') {
        url = endpoints[provider] || endpoints.custom
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
        body = JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
        })
      } else if (provider === 'anthropic') {
        url = endpoints.anthropic
        headers['x-api-key'] = apiKey
        headers['anthropic-version'] = '2023-06-01'
        body = JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        })
      } else if (provider === 'gemini') {
        url = `${endpoints.gemini}?key=${apiKey}`
        body = JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        })
      } else {
        throw new Error(`Unsupported provider: ${provider}`)
      }

      const response = await net.fetch(url, {
        method: 'POST',
        headers,
        body,
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        throw new Error(`AI request failed (${response.status}): ${errText.slice(0, 300)}`)
      }

      const data = await response.json()
      let content = ''

      if (provider === 'anthropic') {
        content = data.content?.[0]?.text || ''
      } else if (provider === 'gemini') {
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      } else {
        content = data.choices?.[0]?.message?.content || ''
      }

      return content
    }
  )

  // ── Background contest alarm (survives window close) ─────────────────────
  alarmManager.init()

  ipcMain.handle('alarm:set', (_event, config) => {
    const enabled = config?.enabled === true
    const remindMinutes =
      typeof config?.remindMinutes === 'number' && config.remindMinutes > 0
        ? config.remindMinutes
        : 15
    const platform: AlarmPlatform =
      config?.platform === 'codechef' ||
      config?.platform === 'leetcode' ||
      config?.platform === 'codeforces'
        ? config.platform
        : 'codechef'
    alarmManager.configure({ enabled, remindMinutes, platform })
    updateTrayMenu()
    return alarmManager.getConfig()
  })

  ipcMain.handle('alarm:get', () => alarmManager.getConfig())

  ipcMain.handle('app:get-login', () => ({
    enabled: app.getLoginItemSettings().openAtLogin,
  }))

  ipcMain.handle('app:set-login', (_event, enabled: boolean) => {
    app.setLoginItemSettings({ openAtLogin: enabled === true })
    return { enabled: enabled === true }
  })

  createTray()
  updateTrayMenu()
  createWindow()

  app.on('activate', function () {
    showMainWindow()
  })
})

function createTray(): void {
  if (!existsSync(TRAY_ICON)) return
  const icon = nativeImage.createFromPath(TRAY_ICON)
  if (icon.isEmpty()) return
  tray = new Tray(icon)
  tray.setToolTip('MI Coding Tracker')
  tray.on('click', () => showMainWindow())
}

function updateTrayMenu(): void {
  if (!tray) return
  const config = alarmManager.getConfig()
  const menu = Menu.buildFromTemplate([
    { label: 'Open MI Coding Tracker', click: () => showMainWindow() },
    {
      label: config.enabled ? 'Contest Alarm: On' : 'Contest Alarm: Off',
      enabled: false,
    },
    {
      label: config.enabled ? 'Disable Contest Alarm' : 'Enable Contest Alarm',
      click: () => {
        alarmManager.configure({ ...config, enabled: !config.enabled })
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('alarm:changed', alarmManager.getConfig())
        }
        updateTrayMenu()
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ])
  tray.setContextMenu(menu)
}

// The app keeps running in the tray so notifications keep firing. Quitting is
// an explicit action (tray menu / app.quit()).
app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  // Intentionally do nothing: hide-to-tray keeps the alarm running.
})