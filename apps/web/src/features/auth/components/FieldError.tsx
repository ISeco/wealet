import { AlertCircleIcon } from './icons'

export function FieldError({ message, marginTop = 7 }: { message: string; marginTop?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop, color: 'var(--neg)', fontSize: 12.5 }}>
      <AlertCircleIcon />
      <span>{message}</span>
    </div>
  )
}
