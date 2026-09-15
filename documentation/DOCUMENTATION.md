# MI Coding Tracker — Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Electron Main Process](#electron-main-process)
3. [Preload Bridge](#preload-bridge)
4. [Database Schema](#database-schema)
5. [API Integrations](#api-integrations)
6. [Security Model](#security-model)
7. [Module Reference](#module-reference)
8. [State Management](#state-management)
9. [Configuration Reference](#configuration-reference)
10. [Build & Packaging](#build--packaging)

---

## Architecture Overview

MI Coding Tracker is an Electron desktop application using a two-process architecture:

- **Main Process** (`electron/main.ts`): Runs in Node.js. Manages BrowserWindow lifecycle, system tray, IPC handlers, contest alarm scheduling, encrypted secret storage, AI request proxying (to bypass CORS and keep API keys out of the renderer), and SQLite database file persistence.

- **Renderer Process** (`src/`): A React 18 single-page application built with Vite. Uses sql.js (SQLite compiled to WebAssembly) for all data storage, Zustand for global state, and Tailwind CSS + Radix UI for the interface.

- **Preload Bridge** (`electron/preload.ts`): Uses `contextBridge.exposeInMainWorld` to safely expose IPC methods to the renderer under `window.secure`, `window.alarm`, and `window.app` namespaces.

### Data Flow

```
User Action → React Component → Zustand Store / dbApi
                                      ↓
                              sql.js (WASM SQLite)
                                      ↓
                              IPC → Main Process → Disk (mi-tracker-db.sqlite)
```

For platform sync:
```
Platform API → Main Process (CORS bypass) → Renderer → dbApi → SQLite
```

---

## Electron Main Process

**File:** `electron/main.ts`

### Window Management

- Default size: 1400x900, minimum: 480x320
- Window bounds (position, size, maximized state) are persisted to `window-state.json` in the user data directory and restored on launch
- Single-instance lock prevents duplicate app instances
- Closing the window hides to system tray instead of quitting, so contest alarms continue firing

### IPC Handlers

| Channel | Direction | Purpose |
|---|---|---|
| `course:fetch:text` | Renderer → Main | Fetches external course pages (bypasses CORS for GFG/CodeChef scraping) |
| `stats:fetch-text` | Renderer → Main | Fetches profile stats APIs (bypasses CORS for GFG stats) |
| `yt:check` | Renderer → Main | Checks if a YouTube video URL is available |
| `notes:save-pdf` | Renderer → Main | Renders notes HTML to PDF via offscreen BrowserWindow |
| `ai:secure-store` | Renderer → Main | Encrypts and stores API key via `safeStorage` |
| `ai:secure-get` | Renderer → Main | Decrypts and retrieves API key |
| `ai:secure-delete` | Renderer → Main | Deletes the encrypted API key file |
| `ai:generate` | Renderer → Main | Proxies AI generation requests (OpenAI, Anthropic, Gemini, DeepSeek, Groq, custom) |
| `db:save` | Renderer → Main | Persists the SQLite database binary to disk |
| `db:load` | Renderer → Main | Reads the SQLite database binary from disk |
| `db:reset` | Renderer → Main | Deletes the SQLite database file |
| `alarm:set` | Renderer → Main | Configures the background contest alarm |
| `alarm:get` | Renderer → Main | Returns current alarm configuration |
| `app:get-login` | Renderer → Main | Returns open-at-login setting |
| `app:set-login` | Renderer → Main | Sets open-at-login preference |

### System Tray

- Displays a tray icon with context menu: Open, Contest Alarm toggle, Quit
- Alarm status is reflected in the tray menu in real-time

### AI Proxy

Routes AI API calls through the main process so the API key never appears in renderer JavaScript bundles. Supports:

- **OpenAI** (`api.openai.com/v1/chat/completions`)
- **Anthropic** (`api.anthropic.com/v1/messages`)
- **Google Gemini** (`generativelanguage.googleapis.com/v1beta/models`)
- **DeepSeek** (`api.deepseek.com/chat/completions`)
- **Groq** (`api.groq.com/openai/v1/chat/completions`)
- **Custom** (any OpenAI-compatible `/chat/completions` endpoint)

---

## Preload Bridge

**File:** `electron/preload.ts`

Exposes four namespaces to the renderer via `contextBridge.exposeInMainWorld`:

```typescript
window.electron  // General IPC (from @electron-toolkit/preload)
window.secure    // { storeApiKey, getApiKey, deleteApiKey, generateAI }
window.alarm     // { set, get, onChanged }
window.app       // { getLaunchAtLogin, setLaunchAtLogin }
```

Context isolation is enabled (`contextIsolation: true`), and `nodeIntegration` is disabled (`nodeIntegration: false`).

---

## Database Schema

**File:** `src/lib/db.ts`

Uses **sql.js** (SQLite compiled to WebAssembly) for all data storage. The database binary is serialized to base64 and persisted to disk via Electron IPC.

### Tables

#### `activity_logs`
Tracks daily coding activity per platform.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Auto-increment ID |
| `platform` | TEXT | Platform identifier (leetcode, codeforces, codechef, hackerrank, geeksforgeeks, github, todo) |
| `date` | TEXT | ISO date string (YYYY-MM-DD) |
| `problems_solved` | INTEGER | Number of problems solved that day |
| `easy` | INTEGER | Easy problems solved |
| `medium` | INTEGER | Medium problems solved |
| `hard` | INTEGER | Hard problems solved |
| `created_at` | TEXT | Timestamp of creation |

Unique constraint on `(platform, date)`.

#### `profiles`
Stores synced platform profile data.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Auto-increment ID |
| `platform` | TEXT | Platform identifier |
| `username` | TEXT | Handle/username on the platform |
| `total_solved` | INTEGER | Total problems solved |
| `easy_solved` | INTEGER | Easy problems solved |
| `medium_solved` | INTEGER | Medium problems solved |
| `hard_solved` | INTEGER | Hard problems solved |
| `rank` | TEXT | Current rank/title |
| `rating` | INTEGER | Current rating |
| `last_synced` | TEXT | ISO timestamp of last sync |
| `created_at` | TEXT | Timestamp of creation |
| `stars` | INTEGER | GitHub stars (GitHub only) |
| `followers` | INTEGER | GitHub followers |
| `following` | INTEGER | GitHub following |
| `public_repos` | INTEGER | GitHub public repos |
| `avatar_url` | TEXT | GitHub avatar URL |
| `name` | TEXT | Display name |
| `bio` | TEXT | GitHub bio |
| `location` | TEXT | GitHub location |
| `blog` | TEXT | Blog URL |
| `top_languages` | TEXT | JSON array of top languages |
| `top_repos` | TEXT | JSON array of top repos |

Unique constraint on `platform`.

#### `notes`
Rich text and drawing notes.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PRIMARY KEY | UUID |
| `title` | TEXT | Note title |
| `content` | TEXT | HTML content |
| `drawing` | TEXT | Base64 canvas drawing |
| `thumbnail` | TEXT | Base64 thumbnail |
| `deleted` | INTEGER | Soft delete flag (0 or 1) |
| `createdAt` | TEXT | ISO timestamp |
| `updatedAt` | TEXT | ISO timestamp |

#### `daily_targets`
Daily problem-solving targets and progress.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Auto-increment ID |
| `date` | TEXT | ISO date string |
| `easy_target` | INTEGER | Easy problems target |
| `easy_done` | INTEGER | Easy problems completed |
| `medium_target` | INTEGER | Medium problems target |
| `medium_done` | INTEGER | Medium problems completed |
| `hard_target` | INTEGER | Hard problems target |
| `hard_done` | INTEGER | Hard problems completed |
| `created_at` | TEXT | Timestamp |

Unique constraint on `date`.

#### `settings`
Key-value store for application settings.

| Column | Type | Description |
|---|---|---|
| `key` | TEXT PRIMARY KEY | Setting key |
| `value` | TEXT | Setting value (string) |

Common keys: `ai_provider`, `ai_model`, `ai_custom_endpoint`, `sql_mode`, `poster_category`, `anime_poster`, `contest_remind_minutes`, `mi_clock_guard_note`.

#### `roadmaps`
AI-generated learning roadmaps.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Auto-increment ID |
| `course_name` | TEXT | Course/topic name |
| `course_url` | TEXT | Course URL |
| `is_coding` | INTEGER | 1 if coding course, 0 if general |
| `roadmap_data` | TEXT | JSON roadmap content |
| `created_at` | TEXT | Timestamp |

#### `ladders`
Codeforces problem ladders.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Auto-increment ID |
| `platform` | TEXT | Always "codeforces" |
| `handle` | TEXT | Codeforces handle |
| `name` | TEXT | Ladder name |
| `min_rating` | INTEGER | Minimum problem rating |
| `max_rating` | INTEGER | Maximum problem rating |
| `problems` | TEXT | JSON array of problems |
| `created_at` | TEXT | Timestamp |
| `last_opened` | TEXT | ISO timestamp |

#### `mock_interviews`
Saved mock interview session history.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Auto-increment ID |
| `title` | TEXT | Session title |
| `difficulty` | TEXT | Easy/Medium/Hard |
| `topic` | TEXT | Topic filter |
| `total_questions` | INTEGER | Total questions in session |
| `solved` | INTEGER | Questions solved |
| `skipped` | INTEGER | Questions skipped |
| `duration_minutes` | INTEGER | Session duration |
| `elapsed_seconds` | INTEGER | Time elapsed |
| `questions` | TEXT | JSON array of questions |
| `notes` | TEXT | JSON map of per-question notes |
| `results` | TEXT | JSON array of results |
| `score` | INTEGER | Session score |
| `status` | TEXT | completed/in-progress |
| `started_at` | TEXT | ISO timestamp |
| `ended_at` | TEXT | ISO timestamp |
| `created_at` | TEXT | Timestamp |

#### `goals`
Planner goals (daily/weekly/monthly/streak).

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Auto-increment ID |
| `title` | TEXT | Goal title |
| `type` | TEXT | daily/weekly/monthly/streak |
| `category` | TEXT | problems/topics/questions/minutes |
| `target_value` | INTEGER | Target value |
| `current_value` | INTEGER | Current progress |
| `unit` | TEXT | Display unit |
| `start_date` | TEXT | ISO date |
| `end_date` | TEXT | ISO date |
| `status` | TEXT | active/achieved/archived |
| `questions` | TEXT | JSON questions (for question-type goals) |
| `created_at` | TEXT | Timestamp |

#### `mock_questions`
Company-wise question bank.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PRIMARY KEY | Question ID |
| `title` | TEXT | Question title |
| `topic` | TEXT | Topic category |
| `difficulty` | TEXT | Easy/Medium/Hard |
| `description` | TEXT | Full problem description |
| `hint` | TEXT | Hint text |
| `url` | TEXT | Problem URL |
| `companies` | TEXT | JSON array of company names |
| `source` | TEXT | leetcode/codechef/geeksforgeeks |

#### `pomodoro_logs`
Pomodoro session history.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Auto-increment ID |
| `type` | TEXT | focus/break |
| `duration_minutes` | INTEGER | Duration |
| `completed` | INTEGER | 1 if completed, 0 if interrupted |
| `started_at` | TEXT | ISO timestamp |
| `ended_at` | TEXT | ISO timestamp |
| `created_at` | TEXT | Timestamp |

#### `sql_practice_sessions`
SQL practice session history.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Auto-increment ID |
| `title` | TEXT | Session title |
| `difficulty` | TEXT | Easy/Medium/Hard |
| `topic` | TEXT | SQL topic |
| `total_questions` | INTEGER | Total questions |
| `solved` | INTEGER | Solved count |
| `wrong` | INTEGER | Wrong count |
| `skipped` | INTEGER | Skipped count |
| `duration_minutes` | INTEGER | Session duration |
| `elapsed_seconds` | INTEGER | Time elapsed |
| `questions` | TEXT | JSON array of questions |
| `answers` | TEXT | JSON map of user answers |
| `results` | TEXT | JSON array of results |
| `score` | INTEGER | Session score |
| `status` | TEXT | completed/in-progress |
| `started_at` | TEXT | ISO timestamp |
| `ended_at` | TEXT | ISO timestamp |
| `created_at` | TEXT | Timestamp |

### Schema Migrations

The database layer handles schema migrations automatically via `ALTER TABLE ADD COLUMN` for new columns. Each migration is idempotent — it checks `PRAGMA table_info()` before adding a column.

### Clock Guard

A monotonic clock guard (`mi_clock_last_ts`) prevents data corruption from system clock rollbacks. If a new timestamp is older than the last recorded timestamp, the write is clamped to prevent activity logs from being dated in the future (which would break streak calculations).

---

## API Integrations

### Platform Sync

**File:** `src/lib/api.ts`

| Platform | API Endpoint | Method |
|---|---|---|
| LeetCode | `leetcode.com/graphql` | POST (GraphQL) |
| Codeforces | `codeforces.com/api/user.info`, `codeforces.com/api/user.status` | GET |
| CodeChef | `codechef-stats.tashif.codes/{username}` | GET |
| HackerRank | `hackerrank-stats.tashif.codes/{username}` | GET |
| GeeksforGeeks | `gfgstatscard.vercel.app/{username}?raw=true` | GET (via main process) |
| GitHub | `api.github.com/users/{handle}`, `api.github.com/users/{handle}/repos`, `api.github.com/users/{handle}/events` | GET |

### Activity Sync

- **LeetCode**: Fetches recent AC submissions via GraphQL, groups by date (last 30 days)
- **Codeforces**: Fetches user.status, filters by verdict=OK and last 30 days
- **GitHub**: Fetches public PushEvents, counts commits per day (last 30 days)
- **CodeChef, HackerRank, GFG**: Profile stats only (no public recent submission API with timestamps)

### Contest Fetching

**File:** `src/lib/contests.ts`

| Platform | Endpoint |
|---|---|
| CodeChef | `codechef.com/contests` (scraped) |
| LeetCode | `leetcode.com/graphql` (contest upcoming query) |
| Codeforces | `codeforces.com/api/contest.list` |

### AI Generation

**File:** `electron/main.ts` (IPC handler `ai:generate`)

All AI requests are proxied through the main process. The renderer sends a payload with `provider`, `apiKey`, `model`, `systemPrompt`, `userPrompt`, and optional parameters. The main process constructs the provider-specific request and forwards the response.

---

## Security Model

### API Key Storage

- API keys are encrypted using Electron's `safeStorage.encryptString()` (OS-level encryption)
- Encrypted keys are stored as binary files at `{userData}/ai_key.enc`
- Keys are never passed to the renderer — all AI generation happens in the main process via IPC

### API Key Lock

- The API key field can be locked with a visual lock indicator
- Locking is a UI-level protection (prevents accidental edits)
- Unlocking requires a one-time password (OTP): a fresh 7-digit code generated per session, valid for 60 seconds, single-use only
- Triple-clicking the lock button opens the OTP dialog

### Database Persistence

- SQLite binary is serialized to base64 and written to `{userData}/mi-tracker-db.sqlite`
- The database is loaded from disk on app startup and saved debounced on changes
- This avoids the 5MB localStorage quota and prevents corruption from concurrent writes

### IPC Security

- `contextIsolation: true` — renderer cannot directly access Node.js APIs
- `nodeIntegration: false` — explicit denial of Node.js in renderer
- All IPC channels validate input types before processing
- URL validation (`/^https?:\/\//i`) prevents protocol injection on fetch proxies

---

## Module Reference

### Dashboard (`src/modules/Dashboard.tsx`)

The main landing page. Components:

- **Streak Tracker**: Shows current consecutive-day coding streak with animated fire icon. Weekly milestones trigger a purple fire filter.
- **Animal Card**: Displays an "animal identity" based on the dominant topic badge earned from solving problems.
- **Level Card**: Shows coder level based on total problems solved.
- **Todo Questions**: Auto-generates 5-6 daily problems (beginner detection at <100 total solved). Problems are picked from a curated pool with difficulty balancing. Auto-checks completion every 60 seconds via platform APIs.
- **Activity Heat Map**: Grid visualization of daily coding activity across all platforms.
- **Ladders**: Codeforces problem ladder progress with solved/unsolved indicators.
- **Contest Countdown**: Live countdown to upcoming contests with platform switching (CodeChef, LeetCode, Codeforces) and alarm toggle.
- **Wordle**: Mini-game for casual engagement.
- **Anime Quote Poster**: Daily motivational poster (configurable category).

### Profiles (`src/modules/Profiles.tsx`)

Platform account management. Features:

- Add/edit/remove platform profiles
- One-click sync to fetch latest stats
- Per-platform stat cards showing solved counts, rank, rating
- GitHub expandable card with bio, top languages, top repos
- Codeforces ladder creation from profile page
- Background auto-sync based on settings

### Notes (`src/modules/Notes.tsx`)

Note-taking with two modes:

- **Text Editor**: contentEditable-based rich text editing
- **Drawing Pad**: HTML5 Canvas with configurable color and stroke width
- Auto-save to SQLite (debounced)
- Export as PNG images
- Sidebar list sorted by last-updated

### Roadmap (`src/modules/Roadmap.tsx`)

AI-powered course analysis:

- Input: course name or URL
- Output: structured JSON with topics, notes, problems, YouTube resources, milestones
- YouTube URL validation (checks availability via main process)
- Auto-replacement of unavailable videos
- History sidebar of previously generated roadmaps

### Interview (`src/modules/Interview.tsx`)

Mock interview simulator:

- Configurable: difficulty, topic, question count, time limit, question source
- Timed session with question navigation
- Per-question hints and notes
- Solved/skipped marking
- Scored results with save-to-history
- Can post question sets to Planner as weekly goals

### Planner (`src/modules/Planner.tsx`)

Productivity tools:

- **Pomodoro Timer**: Configurable focus/break durations, session logging
- **Goals**: Daily/weekly/monthly/streak goals for problems, topics, minutes, questions
- **Calendar Heatmap**: Monthly view with daily problem counts and focus minutes
- **Summary Stats**: Solved today, this week, focus minutes, streak

### SQL (`src/modules/Sql.tsx`)

Interactive SQL practice:

- Dashboard with streak, total solved, accuracy, daily SQL todos, heatmap
- Practice mode with query editor, schema browser, answer checking
- Timed sessions with scored results
- Built-in SQL executor using sql.js
- Tic-Tac-Toe mini-game

### Settings (`src/modules/Settings.tsx`)

Application configuration:

- **Sync Settings**: Auto-sync toggle, frequency, open-at-login, reset all data
- **Contest Reminders**: Configurable lead time (5-120 minutes)
- **Dashboard Cards**: Toggle quote poster, select poster theme (Marvel/DC/Anime/All)
- **SQL Mode**: Toggle SQL practice tab
- **AI Settings**: Provider, API key (encrypted), model, custom endpoint
- **Themes**: Light/Dark/System + 4 color schemes (Blue/Purple/Green/Orange)

---

## State Management

**File:** `src/store/index.ts`

Uses **Zustand** for global state. The store contains:

```typescript
interface AppState {
  profiles: Profile[]              // Platform profiles
  activities: ActivityLog[]        // Daily activity logs
  dailyTarget: DailyTarget | null  // Today's problem targets
  courses: Course[]                // Courses
  notes: Note[]                    // Notes
  questionBank: MockQuestion[]     // Interview question bank
  settings: AppSettings            // App preferences
  lastSynced: string | null        // Last sync timestamp
  isSyncing: boolean               // Sync in progress flag
  activeModule: string             // Current sidebar tab
  tagCounts: Record<string, number> // Topic badge counts
  clockWarning: string | null      // Clock anomaly warning
}
```

Actions: `setProfiles`, `setActivities`, `setDailyTarget`, `setNotes`, `setQuestionBank`, `updateSettings`, `setLastSynced`, `setIsSyncing`, `setActiveModule`, `setTagCounts`, `setClockWarning`, `resetStore`.

The database API (`dbApi`) and key-value store (`dbStore`) are exported from `src/lib/db.ts` and imported alongside the Zustand store.

---

## Configuration Reference

### Environment & Build

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite build config with Electron plugin, path alias (`@/`), vendor chunk splitting |
| `tailwind.config.js` | Tailwind CSS theme and plugin configuration |
| `postcss.config.js` | PostCSS with Tailwind and Autoprefixer |
| `tsconfig.json` | TypeScript config for renderer source |
| `tsconfig.node.json` | TypeScript config for Vite/Node scripts |
| `eslint.config.js` | ESLint with React hooks plugin |

### Path Aliases

`@/` resolves to `./src/` (configured in `vite.config.ts`).

### Vendor Chunk Splitting

The build splits vendor libraries into separate chunks for optimal caching:

- `vendor-react`: react, react-dom
- `vendor-router`: react-router-dom
- `vendor-ui`: lucide-react
- `vendor-charts`: recharts
- `vendor-store`: zustand

### App Metadata

| Field | Value |
|---|---|
| App ID | `com.mi.coding-tracker` |
| Product Name | MI Coding Tracker |
| Default Window | 1400x900 |
| Minimum Window | 480x320 |
| Database File | `{userData}/mi-tracker-db.sqlite` |
| API Key File | `{userData}/ai_key.enc` |
| Window State File | `{userData}/window-state.json` |

---

## Build & Packaging

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server only (browser) |
| `npm run electron:dev` | Vite + Electron in development mode |
| `npm run build` | TypeScript check + Vite build + electron-builder |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `npm run lint` | ESLint on `src/` |

### Packaging Targets

Configured in `package.json` under `build`:

- **Windows**: NSIS installer (`build/icon.ico`)
- **macOS**: DMG (`build/icon.icns`), category: developer-tools
- **Linux**: AppImage (`build/icon.png`)

### Build Output

- `dist/` — Vite-built renderer (HTML/JS/CSS)
- `dist-electron/` — Compiled Electron main process and preload scripts
