import { useState, useEffect } from 'react'
import { useAppStore, dbApi } from '@/store'
import { generateRoadmap, validateYoutubeUrls } from '@/lib/api'
import { secureGenerateAI } from '@/lib/secure'
import { findWebNotes } from '@/lib/notes'
import { TopicNotesDialog } from '@/components/TopicNotesDialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sparkles, Loader2, Code, BookOpen, Clock, ExternalLink, History, ChevronRight, AlertCircle, CheckCircle2, Target, Zap, Lightbulb, Globe, Youtube } from 'lucide-react'
import type { Roadmap } from '@/lib/types'

interface RoadmapProblem {
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  platform: string
  url: string
}

interface RoadmapResource {
  title: string
  url: string
}

interface RoadmapTopic {
  name: string
  description: string
  estimatedHours: number
  notes: string[]
  problems: RoadmapProblem[]
  resources: RoadmapResource[]
}

interface RoadmapMilestone {
  title: string
  description: string
  week: number
}

interface RoadmapJSON {
  isCoding: boolean
  title: string
  description: string
  topics: RoadmapTopic[]
  milestones: RoadmapMilestone[]
}

function parseRoadmapData(raw: string): RoadmapJSON | null {
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

function difficultyColor(d: string): string {
  if (d === 'Easy') return 'bg-green-500/15 text-green-400 border-green-500/30'
  if (d === 'Medium') return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
  return 'bg-red-500/15 text-red-400 border-red-500/30'
}

function TopicWebNotes({ topicName }: { topicName: string }) {
  const webNotes = findWebNotes(topicName)
  if (webNotes.length === 0) return null
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <Globe className="h-3.5 w-3.5 text-blue-400" />
        Best ready-made notes from the web
      </p>
      <div className="space-y-1">
        {webNotes.map((note) => (
          <a
            key={note.url}
            href="#"
            onClick={(e) => { e.preventDefault(); window.open(note.url, '_blank', 'noopener,noreferrer') }}
            className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm text-primary/80 hover:text-primary hover:bg-accent/50 transition-colors"
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{note.title}</span>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {note.source}
            </Badge>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function Roadmap() {
  const { settings } = useAppStore()
  const ai = settings.ai

  const [courseName, setCourseName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<Roadmap[]>([])
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null)
  const [parsedData, setParsedData] = useState<RoadmapJSON | null>(null)
  const [rawResponse, setRawResponse] = useState('')
  const [activeTab, setActiveTab] = useState('generate')
  const [ytValidating, setYtValidating] = useState(false)
  const [ytValidated, setYtValidated] = useState<Map<string, boolean>>(new Map())
  const [fixingVideos, setFixingVideos] = useState<Set<number>>(new Set())

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
        // Validate YouTube URLs in the background
        const urls = parsed.topics.flatMap((t) => t.resources?.map((r) => r.url) ?? [])
        if (urls.length > 0) {
          setYtValidating(true)
          validateYoutubeUrls(urls).then((map: Map<string, boolean>) => {
            setYtValidated(map)
            setYtValidating(false)
          })
        }
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
    // Validate YouTube URLs for historical roadmap
    const data = parseRoadmapData(roadmap.roadmap_data)
    if (data) {
      const urls = data.topics.flatMap((t) => t.resources?.map((r) => r.url) ?? [])
      if (urls.length > 0) {
        setYtValidating(true)
        validateYoutubeUrls(urls).then((map: Map<string, boolean>) => {
          setYtValidated(map)
          setYtValidating(false)
        })
      }
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
    setFixingVideos(new Set(topicsToFix.map((_, i) => i)))

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
      setFixingVideos(new Set())
    }
  }

  return (
    <div className="flex h-full gap-2 p-2">
      {/* History Sidebar */}
      <Card className="w-[280px] flex-shrink-0 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Roadmaps</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setActiveTab('generate')
                setActiveRoadmap(null)
                setParsedData(null)
                setRawResponse('')
              }}
            >
              <Sparkles className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>
          <CardDescription>Previously generated roadmaps</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-3 pb-3">
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No roadmaps yet. Generate one to get started.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {history.map((roadmap) => (
                  <button
                    key={roadmap.id}
                    onClick={() => handleSelectHistory(roadmap)}
                    className={`group flex w-full items-start justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      activeRoadmap?.id === roadmap.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {roadmap.is_coding ? (
                          <Code className="h-3 w-3 flex-shrink-0" />
                        ) : (
                          <BookOpen className="h-3 w-3 flex-shrink-0" />
                        )}
                        <p className="truncate font-medium">
                          {roadmap.course_name}
                        </p>
                      </div>
                      <p
                        className={`mt-0.5 flex items-center gap-1 text-xs ${
                          activeRoadmap?.id === roadmap.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {new Date(roadmap.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 ${
                        activeRoadmap?.id === roadmap.id
                          ? 'hover:bg-primary-foreground/20'
                          : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteHistory(roadmap.id)
                      }}
                    >
                      <span className="text-xs">&times;</span>
                    </Button>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
          <CardHeader className="py-2">
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
                    <Badge variant="secondary">
                      <Code className="mr-1 h-3 w-3" />
                      Coding Course
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <BookOpen className="mr-1 h-3 w-3" />
                      General Course
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          {/* Generate Tab */}
          <TabsContent value="generate" className="flex-1 overflow-auto px-4 pb-4">
            <div className="max-w-xl space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Roadmap Generator
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Enter a course name and the AI will generate a structured learning roadmap
                  with topics, practice problems, and milestones.
                </p>

                {!ai.apiKey && (
                  <div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 mb-4">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-400">No API key configured</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Go to Settings and add your AI provider API key to use the roadmap generator.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Course Name or Topic
                    </label>
                    <Input
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="e.g. Data Structures and Algorithms, Machine Learning..."
                      disabled={isGenerating}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && courseName.trim() && !isGenerating) {
                          handleGenerate()
                        }
                      }}
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !courseName.trim() || !ai.apiKey}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Roadmap...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate Roadmap
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <Sparkles className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Analyzing course content...</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      The AI is generating your personalized learning roadmap
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Result Tab */}
          <TabsContent value="result" className="flex-1 overflow-auto px-4 pb-4">
            {!activeRoadmap ? (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="mx-auto mb-2 h-12 w-12 opacity-30" />
                  <p>Select a roadmap from history or generate a new one</p>
                </div>
              </div>
            ) : parsedData ? (
              <div className="max-w-3xl space-y-6">
                {/* Roadmap Header */}
                <div>
                  <h2 className="text-xl font-bold">{parsedData.title || activeRoadmap.course_name}</h2>
                  {parsedData.description && (
                    <p className="text-sm text-muted-foreground mt-1">{parsedData.description}</p>
                  )}
                </div>

                {/* Coding Course: Topic Breakdown */}
                {parsedData.isCoding && parsedData.topics && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
<h3 className="text-sm font-semibold flex items-center gap-2">
                        <Code className="h-4 w-4 text-primary" />
                        Topic Breakdown
                      </h3>
                       {ytValidating && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Validating videos...
                        </span>
                      )}
                      {!ytValidating && ytValidated.size > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Videos verified
                          </span>
                          {getUnavailableVideoTopics().length > 0 && !fixingVideos.has(0) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleFixUnavailableVideos}
                              className="h-6 px-2 text-xs gap-1"
                            >
                              <Zap className="h-3 w-3" />
                              Fix Unavailable
                            </Button>
                          )}
                          {fixingVideos.has(0) && (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Fixing videos...
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {parsedData.topics.map((topic, idx) => (
                      <Card key={idx}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-sm">{topic.name}</CardTitle>
                            <div className="flex items-center gap-2 shrink-0">
                              <TopicNotesDialog topicName={topic.name} />
                              {topic.estimatedHours > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="mr-1 h-3 w-3" />
                                  ~{topic.estimatedHours}h
                                </Badge>
                              )}
                            </div>
                          </div>
                          {topic.description && (
                            <CardDescription>{topic.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {topic.notes && topic.notes.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                                Notes to understand this topic
                              </p>
                              <ul className="space-y-1.5">
                                {topic.notes.map((note, nIdx) => (
                                  <li
                                    key={nIdx}
                                    className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
                                  >
                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-yellow-400/70 flex-shrink-0" />
                                    <span className="break-words">{note}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <TopicWebNotes topicName={topic.name} />
                          {topic.problems && topic.problems.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Practice Problems
                              </p>
                              <div className="space-y-1.5">
                                {topic.problems.map((problem, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="flex items-center justify-between rounded-md border px-3 py-2"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                      <span className="text-sm truncate">{problem.name}</span>
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0 ${difficultyColor(problem.difficulty)}`}
                                      >
                                        {problem.difficulty}
                                      </Badge>
                                      <span className="text-[10px] text-muted-foreground">
                                        {problem.platform}
                                      </span>
                                    </div>
                                    {problem.url && (
                                      <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); window.open(problem.url, '_blank', 'noopener,noreferrer') }}
                                        className="text-muted-foreground hover:text-primary flex-shrink-0"
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {topic.resources && topic.resources.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Resources
                              </p>
                              <div className="space-y-1">
                                {topic.resources.map((resource, rIdx) => {
                                  const isYoutube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(resource.url)
                                  const isValidated = isYoutube ? ytValidated.get(resource.url) : true
                                  const isAvailable = !isYoutube || isValidated === true
                                  if (!isAvailable) return null
                                  return (
                                    <a
                                      key={rIdx}
                                      href="#"
                                      onClick={(e) => { e.preventDefault(); window.open(resource.url, '_blank', 'noopener,noreferrer') }}
                                      className="flex items-center gap-2 text-sm text-primary/80 hover:text-primary"
                                      title={isYoutube ? 'YouTube video' : resource.url}
                                    >
                                      {isYoutube ? (
                                        <Youtube className="h-3 w-3 flex-shrink-0 text-red-500" />
                                      ) : (
                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                      )}
                                      <span className="truncate">{resource.title}</span>
                                      {isYoutube && isValidated === true && <span className="text-[10px] text-green-500">Verified</span>}
                                      {isYoutube && isValidated === false && <span className="text-[10px] text-red-500">Unavailable</span>}
                                    </a>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* General Course: Study Framework */}
                {!parsedData.isCoding && parsedData.topics && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Study Framework
                      </h3>
                      {ytValidating && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Validating videos...
                        </span>
                      )}
                      {!ytValidating && ytValidated.size > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Videos verified
                          </span>
                          {getUnavailableVideoTopics().length > 0 && !fixingVideos.has(0) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleFixUnavailableVideos}
                              className="h-6 px-2 text-xs gap-1"
                            >
                              <Zap className="h-3 w-3" />
                              Fix Unavailable
                            </Button>
                          )}
                          {fixingVideos.has(0) && (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Fixing videos...
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {parsedData.topics.map((topic, idx) => (
                      <Card key={idx}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-sm">{topic.name}</CardTitle>
                            <div className="flex items-center gap-2 shrink-0">
                              <TopicNotesDialog topicName={topic.name} />
                              {topic.estimatedHours > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="mr-1 h-3 w-3" />
                                  ~{topic.estimatedHours}h
                                </Badge>
                              )}
                            </div>
                          </div>
                          {topic.description && (
                            <CardDescription>{topic.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          {topic.notes && topic.notes.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                                Notes to understand this topic
                              </p>
                              <ul className="space-y-1.5">
                                {topic.notes.map((note, nIdx) => (
                                  <li
                                    key={nIdx}
                                    className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
                                  >
                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-yellow-400/70 flex-shrink-0" />
                                    <span className="break-words">{note}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <TopicWebNotes topicName={topic.name} />
                          {topic.resources && topic.resources.length > 0 && (
                            <div className="space-y-1">
                              {topic.resources.map((resource, rIdx) => {
                                const isYoutube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(resource.url)
                                const isValidated = isYoutube ? ytValidated.get(resource.url) : true
                                const isAvailable = !isYoutube || isValidated === true
                                if (!isAvailable) return null
                                return (
                                  <a
                                    key={rIdx}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); window.open(resource.url, '_blank', 'noopener,noreferrer') }}
                                    className="flex items-center gap-2 text-sm text-primary/80 hover:text-primary"
                                    title={isYoutube ? 'YouTube video' : resource.url}
                                  >
                                    {isYoutube ? (
                                      <Youtube className="h-3 w-3 flex-shrink-0 text-red-500" />
                                    ) : (
                                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{resource.title}</span>
                                    {isYoutube && isValidated === true && <span className="text-[10px] text-green-500">Verified</span>}
                                    {isYoutube && isValidated === false && <span className="text-[10px] text-red-500">Unavailable</span>}
                                  </a>
                                )
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Milestones */}
                {parsedData.milestones && parsedData.milestones.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Milestones
                    </h3>
                    <div className="space-y-2">
                      {parsedData.milestones.map((milestone, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-md border px-3 py-2.5"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                            {milestone.week}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{milestone.title}</p>
                            {milestone.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Fallback */}
                {rawResponse && (
                  <details className="mt-4">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      View raw AI response
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs overflow-auto max-h-64">
                      {rawResponse}
                    </pre>
                  </details>
                )}
              </div>
            ) : (
              <div className="max-w-3xl space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{activeRoadmap.course_name}</h2>
                </div>
                <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-400">Could not parse structured data</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        The AI response could not be parsed as structured JSON. The raw response is shown below.
                      </p>
                    </div>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm overflow-auto max-h-[600px]">
                  {rawResponse}
                </pre>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
