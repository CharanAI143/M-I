import type { LadderProblem } from '@/lib/types'
import { fetchCodeforcesProblemset } from '@/lib/codeforces'

export interface CFLadderDef {
  id: string
  name: string
  minRating: number
  maxRating: number
  count: number
}

export const CF_LADDERS: CFLadderDef[] = [
  { id: 'l0', name: '0 Star (<1000)', minRating: 0, maxRating: 999, count: 200 },
  { id: 'l1', name: '1 Star (1000-1199)', minRating: 1000, maxRating: 1199, count: 150 },
  { id: 'l2', name: '2 Star (1200-1399)', minRating: 1200, maxRating: 1399, count: 150 },
  { id: 'l3', name: '3 Star (1400-1599)', minRating: 1400, maxRating: 1599, count: 150 },
  { id: 'l4', name: '4 Star (1600-1899)', minRating: 1600, maxRating: 1899, count: 150 },
  { id: 'l5', name: '5 Star (1900-2199)', minRating: 1900, maxRating: 2199, count: 150 },
  { id: 'l6', name: '6 Star (2200+)', minRating: 2200, maxRating: 10000, count: 150 },
]

export async function fetchLadderProblems(def: CFLadderDef): Promise<LadderProblem[]> {
  const all = await fetchCodeforcesProblemset()
  return all
    .filter((p) => p.rating >= def.minRating && p.rating <= def.maxRating)
    .sort((a, b) => a.rating - b.rating || a.contestId - b.contestId)
    .slice(0, def.count)
}
