export const SCHEME_PRESETS: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#22c55e',
  orange: '#f97316',
}

const DEFAULT_SCHEME = 'purple'

export function initColorScheme(): void {
  const stored = localStorage.getItem('mi_color_scheme')
  const scheme = stored && SCHEME_PRESETS[stored] ? stored : DEFAULT_SCHEME
  if (!stored) {
    localStorage.setItem('mi_color_scheme', scheme)
  }
  document.documentElement.style.setProperty('--color-primary', SCHEME_PRESETS[scheme])
}

export function getSchemeColor(): string {
  const scheme = localStorage.getItem('mi_color_scheme')
  const preset = scheme ? SCHEME_PRESETS[scheme] : undefined
  const primary = document.documentElement.style.getPropertyValue('--color-primary')?.trim()
  return preset || primary || '#8b5cf6'
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const int = parseInt(full, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

export function getSchemeRgb(): [number, number, number] {
  return hexToRgb(getSchemeColor())
}

export function shadeHex(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex)
  const f = (v: number) => {
    if (percent < 0) {
      // darken
      return Math.max(0, Math.round(v * (1 + percent)))
    }
    // lighten
    return Math.min(255, Math.round(v + (255 - v) * percent))
  }
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(f(r))}${toHex(f(g))}${toHex(f(b))}`
}

// Radial gradient used by the cursor glow, kept opaque so buttons render fully filled.
export function getGlowBackground(): string {
  const color = getSchemeColor()
  const darker = shadeHex(color, -0.25)
  return `radial-gradient(circle at 30% 30%, ${color}, ${darker} 80%)`
}
