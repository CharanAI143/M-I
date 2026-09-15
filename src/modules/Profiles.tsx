import { useState, useEffect, useCallback } from 'react'
import { useAppStore, dbApi } from '@/store'
import { PLATFORMS } from '@/lib/types'
import type { Platform } from '@/lib/types'
import type { Ladder } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { List, Save, ChevronRight, ChevronDown, ExternalLink, Link2, MapPin, Star } from 'lucide-react'
import { LaddersDialog } from '@/components/ladders/LaddersDialog'
import { cfSolveKey } from '@/lib/codeforces'
import { fetchCodeforcesSolved } from '@/lib/codeforces'
import { SYNC_FUNCTIONS, syncDetailedActivity } from '@/lib/api'
import { getToday } from '@/lib/utils'

const FAVICON_URLS: Record<string, string> = {
  leetcode: 'https://leetcode.com/favicon-32x32.png',
  codeforces: 'https://codeforces.com/favicon.ico',
  codechef: 'https://www.codechef.com/favicon.ico',
  hackerrank: 'https://www.hackerrank.com/favicon.ico',
  geeksforgeeks: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200X200.png',
  github: 'https://github.com/favicon.ico',
}

const FALLBACK_FAVICONS: Record<string, string> = {
  leetcode: 'https://www.google.com/s2/favicons?domain=leetcode.com&sz=64',
  codeforces: 'https://www.google.com/s2/favicons?domain=codeforces.com&sz=64',
  codechef: 'https://www.google.com/s2/favicons?domain=codechef.com&sz=64',
  hackerrank: 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=64',
  geeksforgeeks: 'https://www.google.com/s2/favicons?domain=geeksforgeeks.org&sz=64',
  github: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
}

function parseJson<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  leetcode: {
    border: 'border-l-yellow-500',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-500',
    badge: 'bg-yellow-500/20 text-yellow-400',
  },
  codeforces: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    badge: 'bg-blue-500/20 text-blue-400',
  },
  codechef: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    badge: 'bg-purple-500/20 text-purple-400',
  },
  hackerrank: {
    border: 'border-l-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    badge: 'bg-green-500/20 text-green-400',
  },
  gfg: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-400',
  },
  geeksforgeeks: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-400',
  },
  github: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    badge: 'bg-purple-500/20 text-purple-400',
  },
}

export default function Profiles() {
  const { profiles, setProfiles } = useAppStore()
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [laddersOpen, setLaddersOpen] = useState(false)
  const cfHandle = profiles.find((pr) => pr.platform === 'codeforces')?.username ?? ''
  const [ladders, setLadders] = useState<(Ladder & { solvedCount: number })[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const initial: Record<string, string> = {}
    for (const p of PLATFORMS) {
      const existing = profiles.find((pr) => pr.platform === p.id)
      initial[p.id] = existing?.username ?? ''
    }
    setInputValues(initial)
  }, [profiles])

  const loadLadders = useCallback(async () => {
    if (!cfHandle) return
    try {
      const data = await dbApi.loadLadders(cfHandle)
      let solvedKeys = new Set<string>()
      try {
        const s = await fetchCodeforcesSolved(cfHandle)
        solvedKeys = s.keys
      } catch {}
      setLadders(data.map((l) => ({
        ...l,
        solvedCount: l.problems.filter((p) => solvedKeys.has(cfSolveKey(p.contestId, p.index))).length,
      })))
    } catch {}
  }, [cfHandle])

  useEffect(() => {
    loadLadders()
  }, [loadLadders])

  useEffect(() => {
    if (!laddersOpen) loadLadders()
  }, [laddersOpen, loadLadders])

  const handleUsernameChange = (platformId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [platformId]: value }))
  }

  const saveUsername = async (platformId: Platform) => {
    let username = inputValues[platformId]?.trim()
    if (!username) return
    if (platformId === 'github') {
      username = username.replace(/^@/, '').replace(/\/+$/, '')
    }

    // Get previous total before sync
    const existingProfiles = await dbApi.loadProfiles()
    const existing = existingProfiles.find(p => p.platform === platformId)
    const prevTotal = existing?.total_solved ?? 0

    await dbApi.updateProfile(platformId, { username })
    let updated = await dbApi.loadProfiles()
    setProfiles(updated)

    // Sync profile stats and detect delta
    const syncFn = SYNC_FUNCTIONS[platformId]
    if (syncFn) {
      try {
        const data = await syncFn(username)
        await dbApi.updateProfile(platformId, data)
        updated = await dbApi.loadProfiles()
        setProfiles(updated)

        // Detect delta and log as today's activity for ALL platforms
        const newTotal = data.total_solved ?? 0
        const delta = newTotal - prevTotal
        if (delta > 0) {
          const today = getToday()
          const activities = await dbApi.loadActivities()
          const existingActivity = activities.find(
            a => a.platform === platformId && a.date === today
          )
          if (!existingActivity || (existingActivity.problems_solved ?? 0) < delta) {
            await dbApi.logActivity(platformId, delta, 0, 0, 0, today)
            const refreshed = await dbApi.loadActivities()
            useAppStore.getState().setActivities(refreshed)
          }
        }
      } catch (error) {
        console.error(`Failed to sync ${platformId}:`, error)
      }
    }

    // Also sync detailed submission/commit activity for platforms that support it
    if (['codeforces', 'leetcode', 'github'].includes(platformId)) {
      try {
        await syncDetailedActivity(username, platformId)
        const activities = await dbApi.loadActivities()
        useAppStore.getState().setActivities(activities)
      } catch (error) {
        console.error(`Failed to sync ${platformId} activity:`, error)
      }
    }
  }

  const formatTime = (iso: string | null | undefined) => {
    if (!iso) return 'Never synced'
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profiles</h2>
        <p className="text-muted-foreground mt-1">
          Connect and sync your competitive programming and GitHub accounts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORMS.map((platform) => {
          const data = profiles.find((p) => p.platform === platform.id)
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
              key={platform.id}
              className={`relative overflow-hidden border-l-4 ${colors.border} bg-card/50 backdrop-blur`}
            >
              <CardHeader
                className={`pb-3 ${isGithub && data ? 'cursor-pointer select-none' : ''}`}
                onClick={() => {
                  if (isGithub && data) setExpanded(expanded === 'github' ? null : 'github')
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
                        expanded === 'github' ? 'rotate-180' : ''
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

                    {isGithub && expanded === 'github' && (
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
                    value={inputValues[platform.id] ?? ''}
                    onChange={(e) => handleUsernameChange(platform.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputValues[platform.id]?.trim()) {
                        saveUsername(platform.id)
                      }
                    }}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveUsername(platform.id)}
                    disabled={!inputValues[platform.id]?.trim()}
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
                    onClick={async () => {
                      try {
                        await syncDetailedActivity(inputValues[platform.id], platform.id)
                        const activities = await dbApi.loadActivities()
                        useAppStore.getState().setActivities(activities)
                      } catch (error) {
                        console.error(`Failed to sync ${platform.id} activity:`, error)
                      }
                    }}
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
                      onClick={() => setLaddersOpen(true)}
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
        })}
      </div>

      <LaddersDialog open={laddersOpen} onOpenChange={setLaddersOpen} handle={cfHandle} />
    </div>
  )
}
