import { CheckIcon } from '../../../components/ui/icons'

interface IconProps {
  onClick?: () => void
}

export function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
      <path d="M3 7l9 6 9-6"></path>
    </svg>
  )
}

export function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      <rect x="4" y="11" width="16" height="9" rx="2"></rect>
      <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
    </svg>
  )
}

export function EyeIcon({ onClick }: IconProps) {
  return (
    <svg
      onClick={onClick}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--muted)"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: 'pointer', flex: 'none' }}
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  )
}

export function AlertCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 8v5M12 16h.01"></path>
    </svg>
  )
}

export function RuleStatusIcon({ met }: { met: boolean }) {
  if (met) return <CheckIcon color="currentColor" size={14} />
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      <circle cx="12" cy="12" r="9"></circle>
    </svg>
  )
}
