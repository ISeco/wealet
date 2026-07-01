import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  muted?: boolean
  children?: ReactNode
}

const HEIGHTS: Record<'sm' | 'md', number> = { sm: 40, md: 46 }

export function Button({
  variant = 'primary',
  size = 'md',
  muted = false,
  disabled = false,
  style,
  children,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === 'primary'

  const baseStyle = {
    height: HEIGHTS[size],
    padding: size === 'sm' ? '0 18px' : '0 30px',
    borderRadius: 9,
    fontFamily: 'inherit',
    fontSize: size === 'sm' ? 13.5 : 14,
    fontWeight: isPrimary ? 600 : 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 7,
    border: isPrimary ? 'none' : '1px solid var(--border)',
    background: isPrimary ? (disabled ? 'var(--card-2)' : 'var(--grad)') : 'var(--card)',
    color: isPrimary ? (disabled ? 'var(--muted)' : '#fff') : muted ? 'var(--muted)' : 'var(--text)',
    boxShadow: isPrimary && !disabled ? 'var(--shadow)' : 'none',
    opacity: !isPrimary && disabled ? 0.6 : 1,
    transition: 'background .15s, opacity .15s',
  }

  return (
    <button disabled={disabled} style={{ ...baseStyle, ...style }} {...rest}>
      {children}
    </button>
  )
}
