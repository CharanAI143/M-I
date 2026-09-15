import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { PlatformConfig, Profile } from '@/lib/types'
import { COLOR_MAP, FALLBACK_FAVICONS, FAVICON_URLS, formatTime, parseJson } from './profile-utils'
import { ChevronDown, ChevronRight, ExternalLink, Link2, List, MapPin, Save, Star } from 'lucide-react'

interface ProfileCardProps {
  platform: PlatformConfig
  data?: Profile
  inputValue: string
  githubExpanded: boolean
  onUsernameChange: (v: string) => void
  onSave: () => void
  onToggleGithub: () => void
  onSyncActivity: () => void
  onAddLadders: () => void
}

export function ProfileCard({
  platform,
  data,
  inputValue,
  githubExpanded,
  onUsernameChange,
  onSave,
  onToggleGithub,
  onSyncActivity,
  onAddLadders,
}: ProfileCardProps) {
  const colors = COLOR_MAP[platform.id] ?? COLOR_MAP.geeksforgeeks
  const isGithub = platform.id === 'github'
  const favicon = FAVICON_URLS[platform.id]
  const faviconFallback = FALLBACK_FAVICONS[platform.id]
  const dataSyncCount = data?.total_solved ?? 0
  const totalSolved =
    dataSyncCount > 0
      ? dataSyncCount
      : ((data?.easy_solved ?? 0) + (data?.medium_solved ?? 0) + (data?.hard_solved ?? 0))

  const statCells = isGithub
    ? [
        { label: 'Stars', value: data?.stars ?? 0 },
        { label: 'Repos', value: data?.public_repos ?? 0 },
        { label: 'Followers', value: data?.followers ?? 0 },
        { label: 'Following', value: data?.following ?? 0 },
      ]
    : [
        { label: 'Solved', value: totalSolved },
        { label: 'Rank', value: data?.rank ?? '—' as any },
        { label: 'Rating', value: data?.rating ?? '—' as any },
      ]

  const githubLangs = isGithub
    ? parseJson<Array<{ language: string; count: number }>>(data?.top_languages, [])
    : []
  const githubRepos = isGithub
    ? parseJson<Array<{ name: string; language: string | null; stars: number; html_url: string; fork: boolean }>>(
        data?.top_repos,
        []
      )
    : []
  const maxLangCount = Math.max(1, ...githubLangs.map((l) => l.count))

  return (
    <Card
      className={`relative overflow-hidden border-l-4 ${colors.border} bg-card/50 backdrop-blur`}
    >
      <CardHeader
        className={`pb-3 ${isGithub && data ? 'cursor-pointer select-none' : ''}`}
        onClick={() => {
          if (isGithub && data) onToggleGithub()
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className={`p-1.5 rounded-md ${colors.bg}`}>
              {isGithub && data?.avatar_url ? (
                <img
                  src={data.avatar_url}
                  alt={data.username}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <img
                  src={favicon}
                  alt={`${platform.name} icon`}
                  className="h-4 w-4"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget
                    if (img.src !== faviconFallback) img.src = faviconFallback
                  }}
                />
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base leading-tight">
                {isGithub && data?.name ? data.name : platform.name}
              </CardTitle>
              {isGithub && data && (
                <p className="truncate text-xs text-muted-foreground">@{data.username}</p>
              )}
            </div>
          </div>
          {isGithub && data && (
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                githubExpanded ? 'rotate-180' : ''
              }`}
            />
          )}
        </div>
        <CardDescription className="text-xs">
          {formatTime(data?.last_synced)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {data ? (
          <>
            <div className={`grid gap-2 text-center ${isGithub ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {statCells.map((cell) => (
                <div key={cell.label} className="space-y-0.5">
                  <p className="text-2xl font-bold truncate">{cell.value}</p>
                  <p className="text-xs text-muted-foreground">{cell.label}</p>
                </div>
              ))}
            </div>

            {!isGithub && (
              <div className="flex flex-wrap gap-1.5">
                {data.easy_solved != null && data.easy_solved > 0 && (
                  <Badge variant="secondary" className="bg-green-500/15 text-green-400 text-xs">
                    Easy {data.easy_solved}
                  </Badge>
                )}
                {data.medium_solved != null && data.medium_solved > 0 && (
                  <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-400 text-xs">
                    Med {data.medium_solved}
                  </Badge>
                )}
                {data.hard_solved != null && data.hard_solved > 0 && (
                  <Badge variant="secondary" className="bg-red-500/15 text-red-400 text-xs">
                    Hard {data.hard_solved}
                  </Badge>
                )}
              </div>
            )}

            {isGithub && githubExpanded && (
              <div className="space-y-4 rounded-lg border bg-card/40 p-3">
                {data.bio && (
                  <p className="text-sm text-muted-foreground">{data.bio}</p>
                )}

                {(data.location || data.blog) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    {data.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {data.location}
                      </span>
                    )}
                    {data.blog && (
                      <a
                        href={data.blog}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex max-w-full items-center gap-1 hover:underline"
                      >
                        <Link2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{data.blog.replace(/^https?:\/\//i, '')}</span>
                      </a>
                    )}
                  </div>
                )}

                {githubLangs.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Top languages</p>
                    <div className="space-y-1.5">
                      {githubLangs.map(({ language, count }) => (
                        <div key={language} className="flex items-center gap-2 text-xs">
                          <span className="w-24 truncate text-right">{language}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-purple-500/80"
                              style={{ width: `${(count / maxLangCount) * 100}%` }}
                            />
                          </div>
                          <span className="w-8 text-left text-muted-foreground">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {githubRepos.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Top repositories</p>
                    <div className="space-y-1.5">
                      {githubRepos.map((r) => (
                        <button
                          key={r.name}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(r.html_url, '_blank')
                          }}
                          className="flex w-full items-center gap-2 rounded-md border bg-card/50 px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent"
                        >
                          <span className="truncate font-medium">{r.name}</span>
                          {r.language && (
                            <Badge variant="secondary" className="shrink-0 bg-muted px-1.5 py-0 text-[10px]">
                              {r.language}
                            </Badge>
                          )}
                          <span className="ml-auto flex shrink-0 items-center gap-0.5 text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {r.stars}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`https://github.com/${data.username}`, '_blank')
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="ml-1.5">View on GitHub</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No data yet. Enter your username and sync.
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder={isGithub ? `GitHub username` : `${platform.name} username`}
            value={inputValue}
            onChange={(e) => onUsernameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue?.trim()) {
                onSave()
              }
            }}
            className="flex-1 h-9 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            disabled={!inputValue?.trim()}
            className="shrink-0"
          >
            <Save className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Save</span>
          </Button>
        </div>

        {(isGithub || ['codeforces', 'leetcode'].includes(platform.id)) && data && (
          <Button
            size="sm"
            variant="ghost"
            className="flex-1"
            onClick={onSyncActivity}
            title="Fetch recent activity and update heatmap"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="ml-1.5">Sync Activity</span>
          </Button>
        )}

        {platform.id === 'codeforces' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onAddLadders}
              className="flex-1"
            >
              <List className="h-4 w-4" />
              <span className="ml-1.5">Add Ladders</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}