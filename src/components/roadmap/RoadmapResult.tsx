import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Roadmap } from '@/lib/types'
import { AlertCircle, CheckCircle2, Clock, Code, ExternalLink, Lightbulb, Target, Youtube } from 'lucide-react'
import { TopicNotesDialog } from '@/components/TopicNotesDialog'
import { TopicWebNotes } from './TopicWebNotes'
import { VideoStatusBar } from './VideoStatusBar'
import type { RoadmapJSON } from './roadmap-utils'
import { difficultyColor } from './roadmap-utils'

interface RoadmapResultProps {
  roadmap: Roadmap | null
  data: RoadmapJSON | null
  raw: string
  ytValidating: boolean
  ytValidated: Map<string, boolean>
  fixing: boolean
  unavailableCount: number
  onFix: () => void
}

export function RoadmapResult({
  roadmap,
  data,
  raw,
  ytValidating,
  ytValidated,
  fixing,
  unavailableCount,
  onFix,
}: RoadmapResultProps) {
  if (!roadmap) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Target className="mx-auto mb-2 h-12 w-12 opacity-30" />
          <p>Select a roadmap from history or generate a new one</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-3xl space-y-4">
        <div>
          <h2 className="text-xl font-bold">{roadmap.course_name}</h2>
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
          {raw}
        </pre>
      </div>
    )
  }

  const videoBar = (
    <VideoStatusBar
      ytValidating={ytValidating}
      ytValidatedSize={ytValidated.size}
      unavailableCount={unavailableCount}
      fixing={fixing}
      onFix={onFix}
    />
  )

  return (
    <div className="max-w-3xl space-y-6">
      {/* Roadmap Header */}
      <div>
        <h2 className="text-xl font-bold">{data.title || roadmap.course_name}</h2>
        {data.description && (
          <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
        )}
      </div>

      {/* Coding Course: Topic Breakdown */}
      {data.isCoding && data.topics && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              Topic Breakdown
            </h3>
            {videoBar}
          </div>
          {data.topics.map((topic, idx) => (
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
      {!data.isCoding && data.topics && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Study Framework
            </h3>
            {videoBar}
          </div>
          {data.topics.map((topic, idx) => (
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
      {data.milestones && data.milestones.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Milestones
          </h3>
          <div className="space-y-2">
            {data.milestones.map((milestone, idx) => (
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
      {raw && (
        <details className="mt-4">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
            View raw AI response
          </summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs overflow-auto max-h-64">
            {raw}
          </pre>
        </details>
      )}
    </div>
  )
}