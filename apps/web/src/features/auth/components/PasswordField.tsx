import { useState } from 'react'
import { EyeIcon, LockIcon } from './icons'
import { TextField } from './TextField'

interface PasswordFieldProps {
  label?: string
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  error?: string | null
  invalid?: boolean
  maxLength?: number
}

export function PasswordField({ label = 'Contraseña', value, onChange, onFocus, error, invalid, maxLength }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      label={label}
      icon={<LockIcon />}
      type={visible ? 'text' : 'password'}
      required
      maxLength={maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      error={error}
      invalid={invalid}
      placeholder="••••••••"
      endAdornment={<EyeIcon onClick={() => setVisible((v) => !v)} />}
    />
  )
}
