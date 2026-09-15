import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { dbApi } from '@/lib/db'
import { generateRoadmap } from '@/services/ai'
import { validateYoutubeUrls } from '@/services/youtube'
import { secureGenerateAI } from '@/lib/secure'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BookOpen, Code, Sparkles, Target } from 'lucide-react'
import type { Roadmap } from '@/lib/types'
import { parseRoadmapData } from '@/components/roadmap/roadmap-utils'
import { RoadmapHistorySidebar } from '@/components/roadmap/RoadmapHistorySidebar'
import { GeneratePanel } from '@/components/roadmap/GeneratePanel'
import { RoadmapResult } from '@/components/roadmap/RoadmapResult'

export default function Roadmap() {
  const { settings } = useAppStore()
  const ai = settings.ai

  const [courseName, setCourseName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<Roadmap[]>([])
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null)
  const [parsedData, setParsedData] = useState<ReturnType<typeof parseRoadmapData> | null>(null)
  const [rawResponse, setRawResponse] = useState('')
  const [activeTab, setActiveTab] = useState('generate')
  const [ytValidating, setYtValidating] = useState(false)
  const [ytValidated, setYtValidated] = useState<Map<string, boolean>>(new Map())
  const [fixingVideos, setFixingVideos] = useState(false)

  useEffect(() => {
    dbApi.loadRoadmaps().then((roadmaps) => {
      setHistory(roadmaps)
    })
  }, [])

  useEffect(() => {
    if (activeRoadmap) {
      const data = parseRoadmapData(activeRoadmap.roadmap_data)
      setParsedData(data)
      setRawResponse(activeRoadmap.roadmap_data)
    }
  }, [activeRoadmap])

  const validateVideos = (urls: string[]) => {
    if (urls.length === 0) return
    setYtValidating(true)
    validateYoutubeUrls(urls).then((map: Map<string, boolean>) => {
      setYtValidated(map)
      setYtValidating(false)
    })
  }

  const handleGenerate = async () => {
    if (!courseName.trim()) {
      setError('Please enter a course name.')
      return
    }
    if (!ai.apiKey) {
      setError('No AI API key configured. Please add one in Settings.')
      return
    }

    setError('')
    setIsGenerating(true)
    setParsedData(null)
    setRawResponse('')

    try {
      const response = await generateRoadmap(courseName, '', ai.apiKey, ai.provider, ai.model, ai.customEndpoint)

      if (!response) {
        setError('Empty response from AI. Please try again.')
        return
      }

      const newRoadmap: Omit<Roadmap, 'id' | 'created_at'> = {
        course_name: courseName,
        course_url: '',
        is_coding: 0,
        roadmap_data: response,
      }

      await dbApi.addRoadmap(newRoadmap)
      const roadmaps = await dbApi.loadRoadmaps()
      setHistory(roadmaps)

      const latest = roadmaps[roadmaps.length - 1]
      if (latest) {
        setActiveRoadmap(latest)
      }

      setRawResponse(response)
      const parsed = parseRoadmapData(response)
      setParsedData(parsed)

      if (parsed) {
        newRoadmap.is_coding = parsed.isCoding ? 1 : 0
        const urls = parsed.topics.flatMap((t) => t.resources?.map((r) => r.url) ?? [])
        validateVideos(urls)
      }

      setCourseName('')
      setActiveTab('result')
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap. Check your API key and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectHistory = (roadmap: Roadmap) => {
    setActiveRoadmap(roadmap)
    setActiveTab('result')
    const data = parseRoadmapData(roadmap.roadmap_data)
    if (data) {
      const urls = data.topics.flatMap((t) => t.resources?.map((r) => r.url) ?? [])
      validateVideos(urls)
    }
  }

  const handleDeleteHistory = async (id: number) => {
    await dbApi.deleteRoadmap(id)
    setHistory((prev) => prev.filter((r) => r.id !== id))
    if (activeRoadmap?.id === id) {
      setActiveRoadmap(null)
      setParsedData(null)
      setRawResponse('')
    }
  }

  const getUnavailableVideoTopics = (): string[] => {
    if (!parsedData) return []
    const unavailable: string[] = []
    parsedData.topics.forEach((topic) => {
      topic.resources?.forEach((resource) => {
        const isYoutube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(resource.url)
        const isValidated = isYoutube ? ytValidated.get(resource.url) : true
        if (isYoutube && isValidated === false) {
          unavailable.push(topic.name)
        }
      })
    })
    return [...new Set(unavailable)]
  }

  const handleFixUnavailableVideos = async () => {
    if (!parsedData || !activeRoadmap || !ai.apiKey) return

    const unavailableTopics = getUnavailableVideoTopics()
    if (unavailableTopics.length === 0) return

    const topicsToFix = unavailableTopics
    setFixingVideos(true)

    try {
      const systemPrompt = `You are an expert at finding current, working YouTube educational videos.
Given a list of topics, provide 1-2 YouTube video URLs per topic that are HIGH QUALITY, RECENT (ideally 2023-2025), and currently available.
Return ONLY a JSON object with this shape:
{
  "resources": {
    "Topic Name": [{ "title": "Video Title", "url": "https://youtube.com/..." }, ...]
  }
}
Do NOT include any other text, markdown, or explanation.`

      const userPrompt = `Find current working YouTube videos for these topics: ${topicsToFix.join(', ')}.
Requirements:
- Videos must be educational, well-explained, and beginner-friendly
- Prefer videos from 2023 or later
- Only return direct YouTube URLs (youtube.com/watch?v=... or youtu.be/...)
- 1-2 videos per topic`

      const response = await secureGenerateAI({
        provider: ai.provider,
        apiKey: ai.apiKey,
        model: ai.model,
        systemPrompt,
        userPrompt,
        customEndpoint: ai.customEndpoint,
        temperature: 0.3,
        maxTokens: 2048,
      })

      const content = response

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Invalid JSON response')

      const result = JSON.parse(jsonMatch[0])
      const newResources = result.resources || {}

      setParsedData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          topics: prev.topics.map((topic) => {
            if (newResources[topic.name]) {
              return { ...topic, resources: newResources[topic.name] }
            }
            return topic
          }),
        }
      })

      const urls = Object.values(newResources).flatMap((r: any) => r.map((v: any) => v.url))
      if (urls.length > 0) {
        setYtValidating(true)
        validateYoutubeUrls(urls).then((map: Map<string, boolean>) => {
          setYtValidated((prev) => new Map([...prev, ...map]))
          setYtValidating(false)
        })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fix videos')
    } finally {
      setFixingVideos(false)
    }
  }

  return (
    <div className="flex h-full gap-2 p-2">
      {/* History Sidebar */}
      <RoadmapHistorySidebar
        history={history}
        activeId={activeRoadmap?.id ?? null}
        onSelect={handleSelectHistory}
        onNew={() => {
          setActiveTab('generate')
          setActiveRoadmap(null)
          setParsedData(null)
          setRawResponse('')
        }}
        onDelete={handleDeleteHistory}
      />

      {/* Main Content */}
      <Card className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="generate" className="gap-1">
                  <Sparkles className="h-4 w-4" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="result" className="gap-1" disabled={!activeRoadmap}>
                  <Target className="h-4 w-4" />
                  Result
                </TabsTrigger>
              </TabsList>
              {activeRoadmap && parsedData && (
                <div className="flex items-center gap-2">
                  {parsedData.isCoding ? (
                    <Badge variant="secondary" className="gap-1">
                      <Code className="h-3 w-3" />
                      Coding Course
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      General Course
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Generate Tab */}
          <TabsContent value="generate" className="flex-1 overflow-auto px-4 pb-4">
            <GeneratePanel
              courseName={courseName}
              setCourseName={setCourseName}
              isGenerating={isGenerating}
              error={error}
              hasApiKey={!!ai.apiKey}
              onGenerate={handleGenerate}
            />
          </TabsContent>

          {/* Result Tab */}
          <TabsContent value="result" className="flex-1 overflow-auto px-4 pb-4">
            <RoadmapResult
              roadmap={activeRoadmap}
              data={parsedData}
              raw={rawResponse}
              ytValidating={ytValidating}
              ytValidated={ytValidated}
              fixing={fixingVideos}
              unavailableCount={getUnavailableVideoTopics().length}
              onFix={handleFixUnavailableVideos}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}