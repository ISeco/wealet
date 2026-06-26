import { forwardRef } from 'react'
import { MailIcon } from './icons'
import { TextField } from './TextField'

interface EmailFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string | null
}

export const EmailField = forwardRef<HTMLInputElement, EmailFieldProps>(function EmailField(
  { value, onChange, onBlur, error },
  ref,
) {
  return (
    <TextField
      ref={ref}
      label="Correo"
      icon={<MailIcon />}
      type="email"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      error={error}
      placeholder="tucorreo@ejemplo.com"
    />
  )
})
