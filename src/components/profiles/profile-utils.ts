export const FAVICON_URLS: Record<string, string> = {
  leetcode: 'https://leetcode.com/favicon-32x32.png',
  codeforces: 'https://codeforces.com/favicon.ico',
  codechef: 'https://www.codechef.com/favicon.ico',
  hackerrank: 'https://www.hackerrank.com/favicon.ico',
  geeksforgeeks: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200X200.png',
  github: 'https://github.com/favicon.ico',
}

export const FALLBACK_FAVICONS: Record<string, string> = {
  leetcode: 'https://www.google.com/s2/favicons?domain=leetcode.com&sz=64',
  codeforces: 'https://www.google.com/s2/favicons?domain=codeforces.com&sz=64',
  codechef: 'https://www.google.com/s2/favicons?domain=codechef.com&sz=64',
  hackerrank: 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=64',
  geeksforgeeks: 'https://www.google.com/s2/favicons?domain=geeksforgeeks.org&sz=64',
  github: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
}

export function parseJson<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const COLOR_MAP: Record<string, { border: string; bg: string; text: string; badge: string }> = {
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

export function formatTime(iso: string | null | undefined): string {
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