import type { ReactNode } from 'react'
import type { PosterCategory } from '@/lib/types'
import { LayoutGrid } from 'lucide-react'

export const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-4o'],
  anthropic: ['claude-sonnet-5', 'claude-opus-5', 'claude-haiku-4-5'],
  gemini: ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash-lite'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  custom: [],
}

export const SYNC_FREQUENCIES = [5, 10, 15, 30, 60]

export const CONTEST_REMINDER_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120]

export const COLOR_PRESETS: Record<string, { name: string; color: string }> = {
  blue: { name: 'Blue', color: '#3b82f6' },
  purple: { name: 'Purple', color: '#8b5cf6' },
  green: { name: 'Green', color: '#22c55e' },
  orange: { name: 'Orange', color: '#f97316' },
}

// Quote poster galleries. Each button shows the real logo of its gallery:
// the Marvel "MARVEL" wordmark, the DC bullet, and a kitsune (fox) mask as
// the classic anime symbol.
export const POSTER_CATEGORIES: { id: PosterCategory; label: string; color: string; mark: ReactNode }[] = [
  {
    id: 'all',
    label: 'All',
    color: '#8b5cf6',
    mark: (
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_0_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <LayoutGrid className="h-5 w-5" style={{ color: '#8b5cf6' }} aria-hidden="true" />
      </span>
    ),
  },
  {
    id: 'marvel',
    label: 'Marvel',
    color: '#c8102e',
    mark: (
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_0_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <svg viewBox="-80 -60 840 360" className="h-3.5 w-auto" fill="#ed1d24" aria-hidden="true">
          <path d="M631.063,7.184v-61.603H459.644l-28.191,205.803L403.557-54.418H341.74l6.925,54.915c-7.14-14.068-32.449-54.915-88.146-54.915c-0.367-0.024-61.901,0-61.901,0l-0.237,299.974L153.324-54.418l-80.959-0.047L25.753,256.349L25.777-54.42h-77.483l-27.933,174.585l-27.208-174.583h-77.508v337.906h61.036V120.618l27.764,162.866h32.449l27.374-162.866v162.866H81.935l7.14-51.995h47.374l7.116,51.995l115.521,0.071h0.094v-0.071h0.072h0.072V173.799l14.162-2.063l29.319,111.819h0.072h59.61h0.07l-0.024-0.071h0.106h0.072l-38.475-131.057c19.498-14.422,41.513-51.047,35.654-86.084V66.32c0.07,0.474,36.316,217.38,36.316,217.38l71.065-0.216L515.83-22.8v306.285h115.236v-60.773h-54.7v-77.496h54.7V83.518h-54.7V7.184H631.063z M96.265,177.905l16.758-144.461l17.4,144.461H96.265z M273.684,111.201c-4.697,2.278-9.595,3.417-14.363,3.417V5.927c0.083,0,0.179-0.022,0.297-0.022c4.78-0.024,40.419,1.446,40.419,53.774C300.037,87.052,287.916,104.299,273.684,111.201 M754.044,222.665v60.772H641.63V-54.465h60.526v277.13H754.044z" />
        </svg>
      </span>
    ),
  },
  {
    id: 'dc',
    label: 'DC',
    color: '#111111',
    mark: (
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_0_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#0d0d0d" aria-hidden="true">
          <path d="M5.215 8.787h2.154c.601 0 1.088.487 1.088 1.088v4.954c0 .6-.487 1.088-1.088 1.088H6.05V9.475a.159.159 0 00-.066-.129zM12 23.099a11.078 11.078 0 01-8.659-4.155.046.046 0 01.036-.074h5.936a.26.26 0 00.153-.05l2.27-1.648a.159.159 0 00.064-.128V7.616a.159.159 0 00-.065-.129L9.466 5.84a.261.261 0 00-.153-.05H2.886a.046.046 0 01-.037-.071A11.087 11.087 0 0112 .9c3.798 0 7.15 1.907 9.151 4.817a.046.046 0 01-.038.071h-1.597c-.052 0-.1.03-.123.079l-.353.757-1.082-.786a.26.26 0 00-.153-.05h-2.553a.261.261 0 00-.154.05L12.83 7.487a.159.159 0 00-.065.129v9.428c0 .05.024.098.065.128l2.27 1.648a.26.26 0 00.153.05h5.371c.038 0 .06.045.036.074A11.078 11.078 0 0112 23.1zM1.602 8.3l1.038.755c.043.03.068.08.068.132v8.73c0 .046-.06.063-.084.025A11.046 11.046 0 01.901 12c0-1.289.22-2.526.624-3.677a.05.05 0 01.077-.024zm13.67.488h3.225v1.776c0 .046.038.084.084.084h2.701a.098.098 0 00.096-.083l.535-3.374c.007-.044.066-.053.086-.013a11.053 11.053 0 011.1 4.823 11.05 11.05 0 01-1.39 5.382c-.022.04-.084.024-.084-.023v-3.084a.084.084 0 00-.084-.084h-2.96a.084.084 0 00-.084.084v1.642h-1.301a1.089 1.089 0 01-1.089-1.088V9.475a.159.159 0 00-.065-.129zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Z" />
        </svg>
      </span>
    ),
  },
  {
    id: 'anime',
    label: 'Anime',
    color: '#ef4444',
    mark: (
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_0_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
          <path d="M4.2 1.6 L8.8 6.2 L3.4 8.7 Z" fill="#ef4444" stroke="#1f2937" strokeWidth="1" strokeLinejoin="round" />
          <path d="M19.8 1.6 L15.2 6.2 L20.6 8.7 Z" fill="#ef4444" stroke="#1f2937" strokeWidth="1" strokeLinejoin="round" />
          <path
            d="M5.6 8.8 C2.8 10.8 2 14 3.4 17.2 C4.8 20.4 8.2 22.3 12 22.3 C15.8 22.3 19.2 20.4 20.6 17.2 C22 14 21.2 10.8 18.4 8.8 C16.4 9.6 14.4 10 12 10 C9.6 10 7.6 9.6 5.6 8.8 Z"
            fill="#fff"
            stroke="#1f2937"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path d="M7.4 12.6 L10.9 11.8" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16.6 12.6 L13.1 11.8" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="15.8" r="0.9" fill="#1f2937" />
          <path d="M7.2 14.3 L8.7 16.9 L9.9 14.1 Z" fill="#ef4444" />
          <path d="M16.8 14.3 L15.3 16.9 L14.1 14.1 Z" fill="#ef4444" />
        </svg>
      </span>
    ),
  },
]