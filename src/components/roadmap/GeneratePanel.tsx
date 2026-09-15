import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Loader2, Sparkles, Zap } from 'lucide-react'

interface GeneratePanelProps {
  courseName: string
  setCourseName: (v: string) => void
  isGenerating: boolean
  error: string
  hasApiKey: boolean
  onGenerate: () => void
}

export function GeneratePanel({
  courseName,
  setCourseName,
  isGenerating,
  error,
  hasApiKey,
  onGenerate,
}: GeneratePanelProps) {
  return (
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

        {!hasApiKey && (
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
                  onGenerate()
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
            onClick={onGenerate}
            disabled={isGenerating || !courseName.trim() || !hasApiKey}
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
  )
}