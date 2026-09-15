export function AppIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mi-app-icon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a855f7" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="7.5" fill="url(#mi-app-icon)" />
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="7.5" fill="none" stroke="#ffffff22" strokeWidth="1" />
      <g stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M7 16 L12 10" />
        <path d="M7 16 L12 22" />
        <path d="M15 10 L19.5 22" />
        <path d="M22 16 L27 10" />
        <path d="M22 16 L27 22" />
      </g>
    </svg>
  )
}
