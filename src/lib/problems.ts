import type { TodoItem } from '@/lib/types'

export interface PickedProblem {
  id: string
  text: string
  url: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}

interface CFProblem {
  contestId: number
  index: string
  name: string
  rating?: number
  tags?: string[]
}

interface LCProblem {
  title: string
  titleSlug: string
  difficulty: string
  frontendQuestionId: string
  topicTags?: { slug: string }[]
}

// Topic slugs to exclude from the todo list (non-coding questions)
const EXCLUDED_LC_TOPICS = new Set(['sql', 'database', 'shell', 'concurrency'])

const CF_API = 'https://codeforces.com/api/problemset.problems?tags='
const LC_GRAPHQL = 'https://leetcode.com/graphql'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function fetchLeetCodeProblems(difficulty: string, limit: number): Promise<LCProblem[]> {
  try {
    const response = await fetch(LC_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            questions: data {
              title
              titleSlug
              difficulty
              frontendQuestionId: questionFrontendId
              topicTags {
                slug
              }
            }
          }
        }`,
        variables: {
          categorySlug: '',
          skip: 0,
          limit,
          filters: { difficulty },
        },
      }),
    })
    if (!response.ok) return []
    const data = await response.json()
    const questions: LCProblem[] = data?.data?.problemsetQuestionList?.questions || []
    // Keep only coding questions (exclude SQL/database/shell/concurrency)
    return questions.filter((q) =>
      !q.topicTags?.some((t) => EXCLUDED_LC_TOPICS.has(t.slug))
    )
  } catch {
    return []
  }
}

// Start of the current local day as Unix epoch seconds. A streak day only
// counts when a problem is actually solved that day, so solves from earlier
// (e.g. an old problem that happens to land in today's todo) must not advance
// today's streak.
function startOfTodaySeconds(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

export async function checkTodoCompletion(
  todos: TodoItem[],
  profiles: { platform: string; username: string }[]
): Promise<Set<string>> {
  const solved = new Set<string>()
  const todayStart = startOfTodaySeconds()

  const cfProfile = profiles.find((p) => p.platform === 'codeforces' && p.username)
  const lcProfile = profiles.find((p) => p.platform === 'leetcode' && p.username)

  const cfTodos = todos.filter((t) => t.id.startsWith('cf-') && !t.done)
  const lcTodos = todos.filter((t) => t.id.startsWith('lc-') && !t.done)

  // Check Codeforces — only accepts submitted since local midnight count.
  if (cfProfile && cfTodos.length > 0) {
    try {
      const response = await fetch(
        `https://codeforces.com/api/user.status?handle=${cfProfile.username}&from=1&count=10000`
      )
      const data = await response.json()
      if (data.status === 'OK') {
        const solvedToday = new Set<string>()
        for (const sub of data.result) {
          if (
            sub.verdict === 'OK' &&
            sub.problem &&
            Number(sub.creationTimeSeconds) >= todayStart
          ) {
            solvedToday.add(`${sub.problem.contestId}${sub.problem.index}`)
          }
        }
        for (const todo of cfTodos) {
          const match = todo.id.match(/^cf-(\d+\w+)$/)
          if (match && solvedToday.has(match[1])) {
            solved.add(todo.id)
          }
        }
      }
    } catch {
      // Silently fail — will retry on next check
    }
  }

  // Check LeetCode — only accepts submitted since local midnight count.
  if (lcProfile && lcTodos.length > 0) {
    try {
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query recentAcSubmissions($username: String!, $limit: Int!) {
            recentAcSubmissionList(username: $username, limit: $limit) {
              titleSlug
              timestamp
            }
          }`,
          variables: { username: lcProfile.username, limit: 50 },
        }),
      })
      const data = await response.json()
      const solvedToday = new Set<string>()
      for (const s of data?.data?.recentAcSubmissionList || []) {
        if (Number(s.timestamp) >= todayStart) {
          solvedToday.add(s.titleSlug)
        }
      }
      // Map question IDs to slugs from todo URLs
      for (const todo of lcTodos) {
        if (todo.url) {
          const slugMatch = todo.url.match(/leetcode\.com\/problems\/([^/]+)\//)
          if (slugMatch && solvedToday.has(slugMatch[1])) {
            solved.add(todo.id)
          }
        }
      }
    } catch {
      // Silently fail — will retry on next check
    }
  }

  return solved
}

export async function pickDailyProblems(
  excludeIds: string[] = [],
  isBeginner: boolean = false
): Promise<PickedProblem[]> {
  const used = new Set(excludeIds)

  // Fetch from both platforms in parallel
  const [cfResponse, lcEasy, lcMedium, lcHard] = await Promise.all([
    fetch(CF_API).then((r) => {
      if (!r.ok) throw new Error(`CF HTTP ${r.status}`)
      return r.json()
    }),
    fetchLeetCodeProblems('EASY', 50),
    fetchLeetCodeProblems('MEDIUM', 50),
    fetchLeetCodeProblems('HARD', 20),
  ])

  if (cfResponse.status !== 'OK') throw new Error(cfResponse.comment || 'Failed to load CF problems')

  const cfProblems: CFProblem[] = cfResponse.result.problems || []

  const cfEasy = cfProblems.filter((p) => typeof p.rating === 'number' && p.rating <= 1000)
  const cfMedium = cfProblems.filter((p) => typeof p.rating === 'number' && p.rating >= 1100 && p.rating <= 1500)
  const cfHard = cfProblems.filter((p) => typeof p.rating === 'number' && p.rating >= 1600 && p.rating <= 2200)

  const toCF = (p: CFProblem, diff: PickedProblem['difficulty']): PickedProblem => ({
    id: `cf-${p.contestId}${p.index}`,
    text: `[${diff}] ${p.name} (CF ${p.contestId}${p.index})`,
    url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
    difficulty: diff,
    tags: p.tags || [],
  })

  const toLC = (p: LCProblem, diff: PickedProblem['difficulty']): PickedProblem => ({
    id: `lc-${p.frontendQuestionId}`,
    text: `[${diff}] ${p.title} (LC ${p.frontendQuestionId})`,
    url: `https://leetcode.com/problems/${p.titleSlug}/`,
    difficulty: diff,
    tags: (p.topicTags || []).map((t) => t.slug),
  })

  const pickCF = (n: number, diff: PickedProblem['difficulty'], pool: CFProblem[], exclude: Set<string>) => {
    return shuffle(pool.filter((p) => !exclude.has(`cf-${p.contestId}${p.index}`))).slice(0, n).map((p) => toCF(p, diff))
  }

  const pickLC = (n: number, diff: PickedProblem['difficulty'], pool: LCProblem[], exclude: Set<string>) => {
    return shuffle(pool.filter((p) => !exclude.has(`lc-${p.frontendQuestionId}`))).slice(0, n).map((p) => toLC(p, diff))
  }

  // Easy: 3 total — pick 2 from whichever platform has more, 1 from the other
  const usedAfterId = new Set(used)
  let easy2: PickedProblem[]
  let easy1: PickedProblem[]
  if (cfEasy.length >= lcEasy.length) {
    easy2 = pickCF(2, 'easy', cfEasy, usedAfterId)
    easy2.forEach((p) => usedAfterId.add(p.id))
    easy1 = pickLC(1, 'easy', lcEasy, usedAfterId)
    easy1.forEach((p) => usedAfterId.add(p.id))
  } else {
    easy2 = pickLC(2, 'easy', lcEasy, usedAfterId)
    easy2.forEach((p) => usedAfterId.add(p.id))
    easy1 = pickCF(1, 'easy', cfEasy, usedAfterId)
    easy1.forEach((p) => usedAfterId.add(p.id))
  }

  // Medium: 2 total — 1 CF + 1 LC
  const medCF = pickCF(1, 'medium', cfMedium, usedAfterId)
  medCF.forEach((p) => usedAfterId.add(p.id))
  const medLC = pickLC(1, 'medium', lcMedium, usedAfterId)
  medLC.forEach((p) => usedAfterId.add(p.id))

  // Hard: 1 total — LeetCode only (skip for beginners)
  const hardLC = isBeginner ? [] : pickLC(1, 'hard', lcHard, usedAfterId)

  return [...easy2, ...easy1, ...medCF, ...medLC, ...hardLC]
}
