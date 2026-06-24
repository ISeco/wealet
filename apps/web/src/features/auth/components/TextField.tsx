import type { InputHTMLAttributes, ReactNode } from 'react'
import { FieldError } from './FieldError'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ReactNode
  endAdornment?: ReactNode
  error?: string | null
  /** Forces the invalid border/shadow without rendering an error message below the field. */
  invalid?: boolean
}

export function TextField({ label, icon, endAdornment, error, invalid, ...inputProps }: TextFieldProps) {
  const showInvalidStyle = invalid || Boolean(error)

  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>{label}</div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 44,
          border: `1px solid ${showInvalidStyle ? 'var(--neg)' : 'var(--border-strong)'}`,
          borderRadius: 9,
          background: 'var(--field)',
          padding: '0 13px',
          boxShadow: showInvalidStyle ? '0 0 0 3px var(--neg-bg)' : 'none',
        }}
      >
        {icon}
        <input
          {...inputProps}
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--text)',
            marginLeft: icon ? 10 : 0,
          }}
        />
        {endAdornment}
      </div>
      {error && <FieldError message={error} />}
    </div>
  )
}
