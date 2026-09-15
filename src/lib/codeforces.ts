import type { LadderProblem } from '@/lib/types'

export const CODEFORCES_API = 'https://codeforces.com/api'
export const CF_PAGE_SIZE = 1000
export const CF_MAX_PAGES = 8

export function cfProblemUrl(contestId: number, index: string): string {
  return `https://codeforces.com/problemset/problem/${contestId}/${index}`
}

export function cfSolveKey(contestId: number, index: string): string {
  return `${contestId}:${index}`
}

function cfDifficulty(rating: number | null | undefined): 'easy' | 'medium' | 'hard' | null {
  if (rating == null) return null
  if (rating < 1600) return 'easy'
  if (rating < 2200) return 'medium'
  return 'hard'
}

export interface CFSolveStats {
  total: number
  easy: number
  medium: number
  hard: number
  keys: Set<string>
}

export async function fetchCodeforcesSolved(username: string): Promise<CFSolveStats> {
  const keys = new Set<string>()
  let easy = 0
  let medium = 0
  let hard = 0
  let from = 1

  for (let page = 0; page < CF_MAX_PAGES; page++) {
    const response = await fetch(`${CODEFORCES_API}/user.status?handle=${username}&from=${from}&count=${CF_PAGE_SIZE}`)
    const data = await response.json()
    if (data.status !== 'OK') break

    const subs: any[] = data.result
    if (!subs || subs.length === 0) break

    for (const sub of subs) {
      if (sub.verdict === 'OK' && sub.problem) {
        const key = cfSolveKey(sub.problem.contestId, sub.problem.index)
        if (!keys.has(key)) {
          keys.add(key)
          const diff = cfDifficulty(sub.problem.rating)
          if (diff === 'easy') easy++
          else if (diff === 'medium') medium++
          else if (diff === 'hard') hard++
        }
      }
    }

    if (subs.length < CF_PAGE_SIZE) break
    from += CF_PAGE_SIZE
    await new Promise((r) => setTimeout(r, 300))
  }

  return { total: keys.size, easy, medium, hard, keys }
}

let problemsetCache: LadderProblem[] | null = null
let problemsetFetching: Promise<LadderProblem[]> | null = null

export async function fetchCodeforcesProblemset(): Promise<LadderProblem[]> {
  if (problemsetCache) return problemsetCache
  if (!problemsetFetching) {
    problemsetFetching = (async () => {
      try {
        const response = await fetch(`${CODEFORCES_API}/problemset.problems`)
        const data = await response.json()
        if (data.status !== 'OK') return []
        const out: LadderProblem[] = []
        for (const p of data.result?.problems || []) {
          if (p.rating == null) continue
          out.push({
            contestId: p.contestId,
            index: p.index,
            name: p.name,
            rating: p.rating,
            url: cfProblemUrl(p.contestId, p.index),
          })
        }
        problemsetCache = out
        return out
      } catch (e) {
        console.error('Failed to fetch CF problemset:', e)
        return []
      }
    })()
  }
  return problemsetFetching
}
