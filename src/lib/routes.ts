export const ROUTES = {
  dashboard: '/dashboard',
  profiles: '/profiles',
  notes: '/notes',
  roadmap: '/roadmap',
  interview: '/interview',
  planner: '/planner',
  settings: '/settings',
  sql: '/sql',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]