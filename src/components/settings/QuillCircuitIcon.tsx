export function QuillCircuitIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <path d="M17.5 15H9" />
      <path d="M14 18H6" />
      <circle cx="17.5" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="2" cy="22" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}