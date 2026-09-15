export type Theme = 'light' | 'dark' | 'system'

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

export function initTheme(): void {
  const stored = localStorage.getItem('mi_theme') as Theme | null
  const theme: Theme = stored ?? 'system'
  if (!stored) {
    localStorage.setItem('mi_theme', 'system')
  }
  applyTheme(theme)
}
