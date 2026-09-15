export interface ActivityLog {
  id: number
  platform: string
  date: string
  problems_solved: number
  easy: number
  medium: number
  hard: number
  created_at: string
}

export interface Profile {
  id: number
  platform: string
  username: string
  total_solved: number
  easy_solved: number
  medium_solved: number
  hard_solved: number
  rank: string
  rating: number
  last_synced: string
  created_at: string
  stars?: number
  followers?: number
  following?: number
  public_repos?: number
  avatar_url?: string
  name?: string
  bio?: string
  location?: string
  blog?: string
  top_languages?: string
  top_repos?: string
}

export interface Note {
  id: string
  title: string
  content: string
  drawing: string
  thumbnail: string
  deleted?: number
  createdAt: string
  updatedAt: string
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  url?: string
  platform?: 'codeforces' | 'leetcode'
  tags?: string[]
}

export interface DailyTarget {
  id: number
  date: string
  easy_target: number
  easy_done: number
  medium_target: number
  medium_done: number
  hard_target: number
  hard_done: number
  created_at: string
}

export interface Roadmap {
  id: number
  course_name: string
  course_url: string
  is_coding: number
  roadmap_data: string
  created_at: string
}

export interface LadderProblem {
  contestId: number
  index: string
  name: string
  rating: number
  url: string
}

export interface Ladder {
  id: number
  platform: string
  handle: string
  name: string
  min_rating: number
  max_rating: number
  problems: LadderProblem[]
  created_at: string
  last_opened: string | null
}

export interface AISettings {
  provider: 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'groq' | 'custom'
  apiKey: string
  model: string
  customEndpoint: string
}

export type PosterCategory = 'all' | 'marvel' | 'dc' | 'anime'

export interface AppSettings {
  autoSync: boolean
  syncInterval: number
  theme: 'light' | 'dark' | 'system'
  ai: AISettings
  contestRemindMinutes: number
  sqlMode: boolean
  animePoster: boolean
  posterCategory: PosterCategory
}

export type Platform = 'leetcode' | 'codeforces' | 'codechef' | 'hackerrank' | 'geeksforgeeks' | 'github'

export interface PlatformConfig {
  id: Platform
  name: string
  icon: string
  color: string
  bgColor: string
}

export const PLATFORMS: PlatformConfig[] = [
  { id: 'leetcode', name: 'LeetCode', icon: 'Terminal', color: '#FFA116', bgColor: '#FFA11620' },
  { id: 'codeforces', name: 'Codeforces', icon: 'Swords', color: '#1DA1F2', bgColor: '#1DA1F220' },
  { id: 'codechef', name: 'CodeChef', icon: 'ChefHat', color: '#8B5CF6', bgColor: '#8B5CF620' },
  { id: 'hackerrank', name: 'HackerRank', icon: 'Bug', color: '#2EC866', bgColor: '#2EC86620' },
  { id: 'geeksforgeeks', name: 'GeeksforGeeks', icon: 'BookOpen', color: '#2F8D46', bgColor: '#2F8D4620' },
  { id: 'github', name: 'GitHub', icon: 'Github', color: '#6e5494', bgColor: '#6e549420' },
]

export type QuestionSource = 'leetcode' | 'codechef' | 'geeksforgeeks'

export interface MockQuestion {
  id: string
  title: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  description: string
  hint: string
  url: string
  companies?: string[]
  source?: QuestionSource
}

export interface MockInterviewSession {
  id: number
  title: string
  difficulty: string
  topic: string
  total_questions: number
  solved: number
  skipped: number
  duration_minutes: number
  elapsed_seconds: number
  questions: MockQuestion[]
  notes: Record<string, string>
  results?: Array<'solved' | 'skipped' | null>
  score: number
  status: string
  started_at: string
  ended_at: string
  created_at: string
}

export type GoalType = 'daily' | 'weekly' | 'monthly' | 'streak'
export type GoalCategory = 'problems' | 'topics' | 'minutes' | 'questions'

export interface Goal {
  id: number
  title: string
  type: GoalType
  category: GoalCategory
  target_value: number
  current_value: number
  unit: string
  start_date: string
  end_date: string
  status: 'active' | 'achieved' | 'archived'
  questions?: MockQuestion[]
  created_at: string
}

export interface PomodoroLog {
  id: number
  type: 'focus' | 'break'
  duration_minutes: number
  completed: number
  started_at: string
  ended_at: string
  created_at: string
}

export type SqlDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface SqlProblem {
  id: string
  title: string
  topic: string
  difficulty: SqlDifficulty
  description: string
  hint: string
  schema: string
  solution: string
  starterCode?: string
}

export type SqlResultStatus = 'solved' | 'wrong' | 'skipped' | null

export interface SqlPracticeSession {
  id: number
  title: string
  difficulty: string
  topic: string
  total_questions: number
  solved: number
  wrong: number
  skipped: number
  duration_minutes: number
  elapsed_seconds: number
  questions: SqlProblem[]
  answers: Record<string, string>
  results: SqlResultStatus[]
  score: number
  status: string
  started_at: string
  ended_at: string
  created_at: string
}
