interface IconProps {
  color?: string,
  size?: number,
}

const base = { fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export function DashboardIcon({ color = 'currentColor', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <rect x="3" y="3" width="8" height="8" rx="1.5"></rect>
      <rect x="13" y="3" width="8" height="5" rx="1.5"></rect>
      <rect x="13" y="11" width="8" height="10" rx="1.5"></rect>
      <rect x="3" y="14" width="8" height="7" rx="1.5"></rect>
    </svg>
  )
}

export function FundsIcon({ color = 'currentColor', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <rect x="3" y="6" width="18" height="13" rx="2"></rect>
      <path d="M3 10h18"></path>
      <path d="M16 14h2"></path>
    </svg>
  )
}

export function TransfersIcon({ color = 'currentColor', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M4 7h16M4 7l4-4M4 7l4 4"></path>
      <path d="M20 17H4M20 17l-4-4M20 17l-4 4"></path>
    </svg>
  )
}

export function TransactionsIcon({ color = 'currentColor', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M7 16V4M7 4L3 8M7 4l4 4"></path>
      <path d="M17 8v12M17 20l4-4M17 20l-4-4"></path>
    </svg>
  )
}

export function HealthIcon({ color = 'currentColor', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <polyline points="3 12 7 12 9 5 12 19 15 9 17 12 21 12"></polyline>
    </svg>
  )
}

export function CategoriesIcon({ color = 'currentColor', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M11 3l8 8-8.5 8.5a2 2 0 0 1-2.8 0L3 14.8a2 2 0 0 1 0-2.8L11 3z"></path>
      <circle cx="13.5" cy="9.5" r="1.5" fill={color}></circle>
    </svg>
  )
}

export function ImportIcon({ color = 'currentColor', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M12 3v11"></path>
      <path d="M8 10l4 4 4-4"></path>
      <path d="M4 18h16"></path>
    </svg>
  )
}

export function SettingsIcon({ color = 'currentColor', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <line x1="4" y1="6" x2="20" y2="6"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
      <line x1="4" y1="18" x2="20" y2="18"></line>
      <circle cx="8" cy="6" r="2" fill="var(--card)"></circle>
      <circle cx="16" cy="12" r="2" fill="var(--card)"></circle>
      <circle cx="11" cy="18" r="2" fill="var(--card)"></circle>
    </svg>
  )
}

export function SearchIcon({ color = 'var(--muted)', size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <circle cx="11" cy="11" r="7"></circle>
      <path d="M21 21l-4.35-4.35"></path>
    </svg>
  )
}

export function SunIcon({ color = 'currentColor', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <circle cx="12" cy="12" r="4.5"></circle>
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"></path>
    </svg>
  )
}

export function MoonIcon({ color = 'currentColor', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"></path>
    </svg>
  )
}

export function ChevronDownIcon({ color = 'var(--muted)', size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )
}

export function PlusIcon({ color = 'currentColor', size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={2.2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14"></path>
    </svg>
  )
}

export function CloseIcon({ color = 'currentColor', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M6 6l12 12M18 6L6 18"></path>
    </svg>
  )
}

export function ChevronLeftIcon({ color = 'currentColor', size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  )
}

export function ChevronRightIcon({ color = 'currentColor', size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  )
}

export function TrashIcon({ color = 'currentColor', size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M3 6h18"></path>
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
    </svg>
  )
}

export function EditIcon({ color = 'currentColor', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path>
    </svg>
  )
}

export function LockIcon({ color = 'currentColor', size = 11 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <rect x="5" y="11" width="14" height="9" rx="2"></rect>
      <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
    </svg>
  )
}
