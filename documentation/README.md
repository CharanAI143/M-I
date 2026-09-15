<div align="center">

# MI Coding Tracker

**A cross-platform desktop application for tracking competitive programming progress, managing study plans, and practicing interview questions — all in one place.**

[![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

</div>

---

## Features

### Multi-Platform Sync
Automatically fetch and track your coding stats from **6 platforms** — LeetCode, Codeforces, CodeChef, HackerRank, GeeksforGeeks, and GitHub. Background sync keeps your data fresh at configurable intervals.

### Dashboard
A unified dashboard showing your current streak, daily todo questions (auto-generated based on your skill level), an activity heat map, contest countdowns with alarms, Codeforces ladders, a daily quote poster, and a Wordle mini-game.

### Profile Management
Connect and sync multiple competitive programming accounts. View solved problem counts by difficulty, rank, rating, and for GitHub — stars, followers, top languages, and top repositories.

### AI-Powered Roadmaps
Enter any course or topic and let AI generate a structured learning roadmap with topic breakdowns, curated practice problems from LeetCode/Codeforces/GFG, YouTube video resources, and milestone markers. Supports OpenAI, Anthropic, Gemini, DeepSeek, Groq, and custom endpoints.

### Mock Interview Simulator
Configure and run timed mock interview sessions with difficulty/topic/question-source selection. Track solved, skipped, and unsolved problems with hints, per-question notes, and scored results. Post question sets as weekly goals.

### Notes
A built-in note editor with both rich text and freehand drawing (HTML5 Canvas). Notes auto-save to the local SQLite database and can be exported as PNG images.

### Planner & Goals
An interactive Pomodoro timer, goal tracking (daily/weekly/monthly/streak targets for problems, focus minutes, topics, and questions), and a monthly calendar heatmap showing your daily progress.

### SQL Practice
An optional SQL mode with an interactive query editor, real schema browsing, timed practice sessions, a streak tracker, accuracy stats, and a Tic-Tac-Toe mini-game.

### Settings & Theming
Light/dark/system themes, 4 color schemes, customizable sync frequency, contest reminder lead times, API key management with encrypted storage and OTP lock, and a dangerous "Reset All Data" option.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Desktop Shell** | Electron 33 |
| **Frontend Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Language** | TypeScript 5.6 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | Radix UI (Dialog, Tabs, Select, Switch, etc.) |
| **State Management** | Zustand 5 |
| **Local Database** | sql.js (SQLite compiled to WebAssembly) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Data Fetching** | TanStack React Query |
| **Bundling** | electron-builder |

---

## Project Structure

```
M-I/
├── build/                      # App icons for packaging
├── electron/                   # Electron main process
│   ├── main.ts                 #   Window management, IPC handlers, tray, AI proxy
│   ├── preload.ts              #   Secure context bridge to renderer
│   └── alarm.ts                #   Background contest reminder scheduler
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component, data loading, background sync
│   ├── index.css               # Global styles & Tailwind directives
│   ├── fire.png                # Streak fire animation asset
│   ├── components/
│   │   ├── layout/             # Sidebar, Header, Layout shell
│   │   ├── ui/                 # Reusable Radix-based UI primitives (Button, Card, etc.)
│   │   ├── ladders/            # Codeforces ladder management dialogs
│   │   ├── games/              # Wordle mini-game
│   │   ├── ActivityHeatMapGrid.tsx
│   │   ├── AnimeQuotePoster.tsx
│   │   ├── AnimalAnimation.tsx
│   │   ├── ContestCountdown.tsx
│   │   ├── ScoreCard.tsx
│   │   └── TopicNotesDialog.tsx
│   ├── modules/
│   │   ├── Dashboard.tsx       # Streak, todos, heat map, contests, ladders, Wordle
│   │   ├── Profiles.tsx        # Platform account sync & stats
│   │   ├── Notes.tsx           # Rich text & drawing notes
│   │   ├── Roadmap.tsx         # AI-generated learning roadmaps
│   │   ├── Interview.tsx       # Mock interview simulator
│   │   ├── Planner.tsx         # Pomodoro, goals, calendar
│   │   ├── Sql.tsx             # SQL practice environment
│   │   └── Settings.tsx        # App preferences & AI config
│   ├── lib/
│   │   ├── api.ts              # Platform sync functions & roadmap generation
│   │   ├── db.ts               # SQLite database layer (sql.js/WASM)
│   │   ├── types.ts            # TypeScript interfaces & platform configs
│   │   ├── utils.ts            # Streak calculation, date helpers
│   │   ├── secure.ts           # Encrypted API key storage & AI proxy
│   │   ├── contests.ts         # Contest fetching (CodeChef, LeetCode, Codeforces)
│   │   ├── codeforces.ts       # Codeforces-specific API helpers
│   │   ├── problems.ts         # Daily problem picker & completion checker
│   │   ├── badges.ts           # Topic-based badge/animal identity system
│   │   ├── ladders.ts          # Codeforces ladder problem fetching
│   │   ├── interview.ts        # Interview question bank & session logic
│   │   ├── notes.ts            # Notes CRUD helpers
│   │   ├── sqlProblems.ts      # SQL practice problem definitions
│   │   ├── sqlRunner.ts        # In-browser SQL query executor
│   │   ├── colorScheme.ts      # Theme color scheme logic
│   │   ├── theme.ts            # Light/dark/system theme application
│   │   └── electron.d.ts       # Type declarations for Electron IPC bridge
│   └── store/
│       └── index.ts            # Zustand global state store
├── index.html                  # HTML entry point
├── package.json                # Dependencies & scripts
├── vite.config.ts              # Vite + Electron plugin config
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── tsconfig.json               # TypeScript config (renderer)
├── tsconfig.node.json          # TypeScript config (Vite/Node)
├── eslint.config.js            # ESLint configuration
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/M-I.git
cd M-I

# Install dependencies
npm install
```

### Development

```bash
# Start the Vite dev server with Electron
npm run electron:dev
```

This launches the app in development mode with hot-reload enabled.

### Build & Package

```bash
# Type-check, build frontend, and package the Electron app
npm run build
```

The packaged installer will be output to the `dist/` directory.

### Other Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server only (browser preview) |
| `npm run build` | Full production build with Electron packaging |
| `npm run preview` | Preview the built frontend |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Lint the `src/` directory with ESLint |

---

## Configuration

### AI Provider Setup

Navigate to **Settings > Credits & AI Models** to configure your AI provider for roadmap generation and interview features.

Supported providers:

| Provider | Models |
|---|---|
| OpenAI | gpt-5.6-sol, gpt-5.6-terra, gpt-5.6-luna, gpt-4o |
| Anthropic | claude-sonnet-5, claude-opus-5, claude-haiku-4-5 |
| Google Gemini | gemini-3.5-flash, gemini-3.1-pro-preview, gemini-3.5-flash-lite |
| DeepSeek | deepseek-chat, deepseek-reasoner |
| Groq | llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768, gemma2-9b-it |
| Custom | Any OpenAI-compatible endpoint |

API keys are encrypted via OS-level `safeStorage` and never touch the renderer bundle.

### Platform Profiles

Go to **Profiles** to connect your accounts. Enter your username for each platform and click Save. The app will fetch your latest stats and begin tracking daily activity.

### Sync Settings

- **Auto-Sync**: Toggle automatic background syncing (default: on)
- **Sync Interval**: 5, 10, 15, 30, or 60 minutes
- **Open at Login**: Start the app at OS login so contest alarms keep working

### Contest Reminders

Configure how early you want to be notified before a contest starts (5–120 minutes). Notifications work both in-browser and via the system tray when the window is closed.

### Theming

- **Theme**: Light / Dark / System
- **Color Scheme**: Blue, Purple, Green, or Orange
- **Quote Poster**: Toggle the daily motivational poster (Marvel, DC, Anime, or All)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Electron Main Process            │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Window    │  │  Alarm   │  │  AI Proxy    │  │
│  │  Manager   │  │  Scheduler│  │  (IPC)       │  │
│  └─────┬─────┘  └─────┬────┘  └──────┬───────┘  │
│        │               │              │          │
│  ┌─────┴───────────────┴──────────────┴───────┐  │
│  │            Preload Bridge (IPC)            │  │
│  └──────────────────┬────────────────────────┘  │
├─────────────────────┼───────────────────────────┤
│                 Renderer Process                │
│  ┌──────────────────┴────────────────────────┐  │
│  │              React App (Vite)             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐  │  │
│  │  │ Zustand  │  │ sql.js   │  │ Radix  │  │  │
│  │  │ Store    │  │ (SQLite) │  │ UI     │  │  │
│  │  └──────────┘  └──────────┘  └────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

- **Main Process** (`electron/`): Manages windows, system tray, contest alarm scheduling, encrypted API key storage, AI request proxying, and database file persistence via IPC.
- **Preload** (`electron/preload.ts`): Secure context bridge exposing `window.secure`, `window.alarm`, and `window.app` APIs to the renderer.
- **Renderer** (`src/`): React SPA with Zustand state management, sql.js for local SQLite (compiled to WASM), and all UI modules.

Data is stored locally in a SQLite database file (`mi-tracker-db.sqlite`) persisted to the user's app data directory, avoiding localStorage size limits and ensuring data survives reinstalls.

---

## Supported Platforms

| Platform | Profile Stats | Activity Sync | Contest Tracking |
|---|---|---|---|
| LeetCode | Solved counts, rank, reputation | Recent AC submissions | Yes |
| Codeforces | Solved counts, rank, rating | Recent verdicts | Yes |
| CodeChef | Solved counts, rank, rating | — | Yes |
| HackerRank | Solved count, ranking, score | — | — |
| GeeksforGeeks | Solved counts, institute rank, score | — | — |
| GitHub | Stars, followers, repos, top languages, top repos | Push events | — |

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change, then submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
