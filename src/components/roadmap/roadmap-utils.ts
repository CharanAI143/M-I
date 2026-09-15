export interface RoadmapProblem {
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  platform: string
  url: string
}

export interface RoadmapResource {
  title: string
  url: string
}

export interface RoadmapTopic {
  name: string
  description: string
  estimatedHours: number
  notes: string[]
  problems: RoadmapProblem[]
  resources: RoadmapResource[]
}

export interface RoadmapMilestone {
  title: string
  description: string
  week: number
}

export interface RoadmapJSON {
  isCoding: boolean
  title: string
  description: string
  topics: RoadmapTopic[]
  milestones: RoadmapMilestone[]
}

export function parseRoadmapData(raw: string): RoadmapJSON | null {
  function tryParse(s: string): RoadmapJSON | null {
    try {
      const parsed = JSON.parse(s)
      if (parsed && typeof parsed === 'object' && 'isCoding' in parsed) {
        return parsed as RoadmapJSON
      }
    } catch {}
    return null
  }

  let cleaned = raw.trim()

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim()
  }

  // Try direct parse first
  const direct = tryParse(cleaned)
  if (direct) return direct

  // Try extracting JSON object from surrounding text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    const extracted = tryParse(jsonMatch[0])
    if (extracted) return extracted

    // Try fixing trailing commas (common AI mistake)
    const fixed = jsonMatch[0]
      .replace(/,\s*([\]}])/g, '$1')
      .replace(/,\s*$/, '')
    const fixedParse = tryParse(fixed)
    if (fixedParse) return fixedParse
  }

  return null
}

export function difficultyColor(d: string): string {
  if (d === 'Easy') return 'bg-green-500/15 text-green-400 border-green-500/30'
  if (d === 'Medium') return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
  return 'bg-red-500/15 text-red-400 border-red-500/30'
}