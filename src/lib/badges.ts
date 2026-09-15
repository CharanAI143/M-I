import type { LucideIcon } from 'lucide-react'
import {
  TreePine,
  Network,
  Workflow,
  Link,
  Braces,
  Sigma,
  Zap,
  ScanSearch,
  Hash,
  SquareStack,
  ListOrdered,
  ArrowLeftRight,
  ArrowDownUp,
  Undo2,
  Binary,
  Repeat,
  TrendingUp,
  Split,
  Code,
} from 'lucide-react'
import { CODEFORCES_API, cfSolveKey, CF_PAGE_SIZE, CF_MAX_PAGES } from '@/lib/codeforces'
import type { Profile } from '@/lib/types'

const TAG_STORAGE_KEY = 'mi-tracker-tag-counts'

export interface TopicBadge {
  id: string
  animal: string
  theme: string
  icon: LucideIcon
  desc: string
  match: string[]
}

// Tag slugs are matched both for LeetCode (`dynamic-programming`) and
// Codeforces (`dp`) conventions. Each topic maps to an animal-themed badge.
export const TOPIC_BADGES: TopicBadge[] = [
  {
    id: 'trees',
    animal: 'Beaver',
    theme: 'Trees',
    icon: TreePine,
    desc: 'Dams built from wood — tree problems are home turf.',
    match: ['tree', 'trees', 'binary-tree', 'bst', 'binary-search-tree'],
  },
  {
    id: 'graphs',
    animal: 'Spider',
    theme: 'Graphs',
    icon: Network,
    desc: 'Weaves webs across every node and edge.',
    match: [
      'graph',
      'graphs',
      'depth-first-search',
      'breadth-first-search',
      'shortest-paths',
      'dfs-and-similar',
      'bfs',
      'topological-sort',
    ],
  },
  {
    id: 'dp',
    animal: 'Bee',
    theme: 'Dynamic Programming',
    icon: Workflow,
    desc: 'A busy hive of overlapping substructures.',
    match: ['dynamic-programming', 'dp', 'memoization'],
  },
  {
    id: 'linked-list',
    animal: 'Snake',
    theme: 'Linked Lists',
    icon: Link,
    desc: 'Slithers from node to node through the chain.',
    match: ['linked-list', 'linked-lists', 'doubly-linked-list', 'circular-linked-list'],
  },
  {
    id: 'strings',
    animal: 'Parrot',
    theme: 'Strings',
    icon: Braces,
    desc: 'Repeats palindromes, anagrams and substrings.',
    match: ['string', 'strings'],
  },
  {
    id: 'math',
    animal: 'Owl',
    theme: 'Math',
    icon: Sigma,
    desc: 'Wise in numbers, proofs and combinatorics.',
    match: ['math', 'number-theory', 'combinatorics'],
  },
  {
    id: 'greedy',
    animal: 'Fox',
    theme: 'Greedy',
    icon: Zap,
    desc: 'Always grabs the locally best acorn first.',
    match: ['greedy'],
  },
  {
    id: 'binary-search',
    animal: 'Hawk',
    theme: 'Binary Search',
    icon: ScanSearch,
    desc: 'Hones in on the answer with piercing focus.',
    match: ['binary-search', 'binary-search-and-search', 'ternary-search'],
  },
  {
    id: 'hash-table',
    animal: 'Rabbit',
    theme: 'Hash Tables',
    icon: Hash,
    desc: 'Fast — never rescans from the start again.',
    match: ['hash-table', 'hash-tables', 'hash'],
  },
  {
    id: 'stack',
    animal: 'Squirrel',
    theme: 'Stacks',
    icon: SquareStack,
    desc: 'Piles things up like hoarded nuts.',
    match: ['stack', 'stacks', 'monotonic-stack'],
  },
  {
    id: 'queue',
    animal: 'Sheep',
    theme: 'Queues',
    icon: ListOrdered,
    desc: 'Marches in first-in, first-out order.',
    match: ['queue', 'queues', 'monotonic-queue'],
  },
  {
    id: 'two-pointers',
    animal: 'Shark',
    theme: 'Two Pointers',
    icon: ArrowLeftRight,
    desc: 'Two fins, one clean pass through the array.',
    match: ['two-pointers', 'pointer', 'pointers'],
  },
  {
    id: 'sorting',
    animal: 'Duck',
    theme: 'Sorting',
    icon: ArrowDownUp,
    desc: 'Lines everything up neatly in a row.',
    match: ['sorting', 'sortings'],
  },
  {
    id: 'backtracking',
    animal: 'Octopus',
    theme: 'Backtracking',
    icon: Undo2,
    desc: 'Tries every arm, then retraces its steps.',
    match: ['backtracking'],
  },
  {
    id: 'bit-manipulation',
    animal: 'Crab',
    theme: 'Bit Manipulation',
    icon: Binary,
    desc: 'Pinches on individual bits with precision.',
    match: ['bit-manipulation', 'bitwise', 'bitmasks'],
  },
  {
    id: 'recursion',
    animal: 'Turtle',
    theme: 'Recursion',
    icon: Repeat,
    desc: 'A shell within a shell within a shell.',
    match: ['recursion', 'divide-and-conquer-recursion'],
  },
  {
    id: 'heap',
    animal: 'Whale',
    theme: 'Heaps',
    icon: TrendingUp,
    desc: 'The biggest one always floats to the top.',
    match: ['heap', 'heaps', 'heap-priority-queue', 'priority-queue', 'priority-queues'],
  },
  {
    id: 'divide-conquer',
    animal: 'Frog',
    theme: 'Divide & Conquer',
    icon: Split,
    desc: 'Splits the pond, conquers each half.',
    match: ['divide-and-conquer', 'divide-and-conquer-sort'],
  },
  {
    id: 'implementation',
    animal: 'Cat',
    theme: 'Implementation',
    icon: Code,
    desc: 'Gets any job done, hands on.',
    match: ['implementation'],
  },
]

const TAG_TO_BADGE: Record<string, string> = {}
for (const badge of TOPIC_BADGES) {
  for (const tag of badge.match) {
    TAG_TO_BADGE[tag] = badge.id
  }
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/_/g, '-')
}

export function badgeIdForTag(tag: string): string | null {
  const key = normalizeTag(tag)
  if (!key) return null
  if (TAG_TO_BADGE[key]) return TAG_TO_BADGE[key]
  // Loose fallback: "dynamic programming", "linked list", etc.
  const loose = key.replace(/\s+/g, '-')
  return TAG_TO_BADGE[loose] ?? null
}

export function loadTagCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(TAG_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveTagCounts(counts: Record<string, number>): void {
  try {
    localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(counts))
  } catch {
    // ignore quota errors
  }
}

export function mergeCounts(...maps: Array<Record<string, number> | undefined>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const map of maps) {
    for (const [k, v] of Object.entries(map ?? {})) {
      out[k] = (out[k] ?? 0) + v
    }
  }
  return out
}

export interface BadgeCount {
  badge: TopicBadge
  count: number
}

export function rankedBadges(counts: Record<string, number>): BadgeCount[] {
  return TOPIC_BADGES.map((badge) => ({ badge, count: counts[badge.id] ?? 0 }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count)
}

export function dominantBadge(counts: Record<string, number>): BadgeCount | null {
  const ranked = rankedBadges(counts)
  return ranked.length > 0 ? ranked[0] : null
}

// ── Coder Levels ──────────────────────────────────────────────────────────

export interface CoderLevel {
  index: number
  name: string
  minSolved: number
}

export const CODER_LEVELS: CoderLevel[] = [
  { index: 1, name: 'Novice', minSolved: 0 },
  { index: 2, name: 'Apprentice', minSolved: 10 },
  { index: 3, name: 'Problem Solver', minSolved: 25 },
  { index: 4, name: 'Algorithm Hunter', minSolved: 50 },
  { index: 5, name: 'Code Warrior', minSolved: 100 },
  { index: 6, name: 'Veteran', minSolved: 200 },
  { index: 7, name: 'Expert', minSolved: 350 },
  { index: 8, name: 'Master', minSolved: 550 },
  { index: 9, name: 'Grandmaster', minSolved: 800 },
  { index: 10, name: 'Legend', minSolved: 1200 },
]

export function totalSolvedAcross(profiles: Profile[]): number {
  return profiles.reduce((sum, p) => sum + (p.total_solved || 0), 0)
}

export function getCoderLevel(totalSolved: number): {
  level: CoderLevel
  nextLevel: CoderLevel | null
  progressPct: number
} {
  let level = CODER_LEVELS[0]
  let nextLevel: CoderLevel | null = null
  for (let i = 0; i < CODER_LEVELS.length; i++) {
    if (totalSolved >= CODER_LEVELS[i].minSolved) {
      level = CODER_LEVELS[i]
      nextLevel = CODER_LEVELS[i + 1] ?? null
    }
  }
  let progressPct = 100
  if (nextLevel) {
    const span = nextLevel.minSolved - level.minSolved
    const gained = totalSolved - level.minSolved
    progressPct = span > 0 ? Math.min(100, Math.round((gained / span) * 100)) : 100
  }
  return { level, nextLevel, progressPct }
}

// ── Codeforces tag history (backfill for badges) ─────────────────────────

let cfTagCache: Record<string, number> | null = null
let cfTagFetching: Promise<Record<string, number>> | null = null

export async function fetchCfTagHistory(handle: string): Promise<Record<string, number>> {
  if (cfTagCache) return cfTagCache
  if (cfTagFetching) return cfTagFetching

  cfTagFetching = (async () => {
    const counts: Record<string, number> = {}
    const seen = new Set<string>()
    let from = 1

    for (let page = 0; page < CF_MAX_PAGES; page++) {
      try {
        const response = await fetch(
          `${CODEFORCES_API}/user.status?handle=${handle}&from=${from}&count=${CF_PAGE_SIZE}`
        )
        const data = await response.json()
        if (data.status !== 'OK') break

        const subs: any[] = data.result
        if (!subs || subs.length === 0) break

        for (const sub of subs) {
          if (sub.verdict === 'OK' && sub.problem) {
            const key = cfSolveKey(sub.problem.contestId, sub.problem.index)
            if (seen.has(key)) continue
            seen.add(key)
            for (const tag of sub.problem.tags ?? []) {
              const id = badgeIdForTag(tag)
              if (id) counts[id] = (counts[id] ?? 0) + 1
            }
          }
        }

        if (subs.length < CF_PAGE_SIZE) break
        from += CF_PAGE_SIZE
        await new Promise((r) => setTimeout(r, 300))
      } catch {
        break
      }
    }

    cfTagCache = counts
    return counts
  })()

  return cfTagFetching
}

// ── LeetCode tag history (the profile "bubble graph") ─────────────────────

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql'

interface LCLevelTagCount {
  tagName: string
  tagSlug: string
  problemsSolved: number
}

let lcTagCache: Record<string, number> | null = null
let lcTagFetching: Promise<Record<string, number>> | null = null

// Mirrors the "Problem Solving" skill breakdown shown on a LeetCode profile
// page. The bubble graph is fed by `matchedUser.tagProblemCounts`, grouped into
// fundamental / intermediate / advanced proficiency levels.
export async function fetchLeetCodeTagStats(username: string): Promise<Record<string, number>> {
  if (lcTagCache) return lcTagCache
  if (lcTagFetching) return lcTagFetching

  lcTagFetching = (async () => {
    const counts: Record<string, number> = {}
    try {
      const response = await fetch(LEETCODE_GRAPHQL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query skillStats($username: String!) {
              matchedUser(username: $username) {
                tagProblemCounts {
                  advanced { tagName tagSlug problemsSolved }
                  intermediate { tagName tagSlug problemsSolved }
                  fundamental { tagName tagSlug problemsSolved }
                }
              }
            }
          `,
          variables: { username },
        }),
      })
      if (!response.ok) return counts
      const data = await response.json()
      const levels = data?.data?.matchedUser?.tagProblemCounts
      for (const level of Object.values(levels ?? {})) {
        for (const tag of (level as LCLevelTagCount[] | undefined) ?? []) {
          const id = badgeIdForTag(tag.tagSlug)
          if (id) counts[id] = (counts[id] ?? 0) + tag.problemsSolved
        }
      }
    } catch {
      // ignore — badge history is best-effort
    }
    lcTagCache = counts
    return counts
  })()

  return lcTagFetching
}