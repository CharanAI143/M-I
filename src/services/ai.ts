// AI-assisted course roadmap generation. Prompts are routed through the main
// process so the API key never appears in renderer code (see @/lib/secure).

import { secureGenerateAI } from '@/lib/secure'

export async function generateRoadmap(
  courseName: string,
  courseUrl: string,
  apiKey: string,
  provider: string,
  model: string,
  customEndpoint?: string
): Promise<string> {
  const outputSchema = {
    isCoding: 'boolean',
    title: 'string',
    description: 'string',
    topics: [
      {
        name: 'string',
        description: 'string',
        estimatedHours: 'number',
        notes: ['string'],
        problems: [{ name: 'string', difficulty: '"Easy"|"Medium"|"Hard"', platform: '"LeetCode"|"Codeforces"|"GFG"', url: 'string' }],
        resources: [{ title: 'string', url: 'string' }],
      },
    ],
    milestones: [{ title: 'string', description: 'string', week: 'number' }],
  }

  const systemPrompt = `You are an expert course analyzer. Given a course name or URL, determine if it is coding-related or a general course.

If it is a CODING course, produce a practical topic-by-topic breakdown with specific, real, curated practice problems (Easy, Medium, Hard) drawn from LeetCode, Codeforces, and GeeksforGeeks, one per row, each with a working problem URL.

If it is a GENERAL course, produce an optimal study framework with key concepts, relevant resource links, and actionable learning milestones.

CRITICAL OUTPUT RULES:
- Respond with ONLY one valid JSON object. Do NOT wrap it in markdown fences, do NOT add prose or code blocks around it, and do NOT include trailing commas.
- Every field in the schema below must be present.
- "notes" must contain 3-5 bullet-point notes per topic written in simple, beginner-friendly language that explain the core ideas, key concepts, common pitfalls, and how to approach, understand, and study the topic.
- "problems" must contain at least 3 problems per topic, and every problem must include a real "url".
- "resources" MUST contain only YouTube video URLs (https://www.youtube.com/... or https://youtu.be/...) — NO website links, NO blog links, NO documentation links. Each resource must be a direct link to a well-explained YouTube video covering the topic.
- "milestones" must contain 3-6 entries with increasing "week" values.

Return exactly this shape:
${JSON.stringify(outputSchema, null, 2)}`

  const userPrompt = `Analyze this course and create a comprehensive roadmap: ${courseName}${courseUrl ? ` (${courseUrl})` : ''}`

  // Route through the main process so the API key never appears in renderer code.
  return secureGenerateAI({
    provider,
    apiKey,
    model,
    systemPrompt,
    userPrompt,
    customEndpoint,
    temperature: 0.7,
    maxTokens: 8192,
  })
}