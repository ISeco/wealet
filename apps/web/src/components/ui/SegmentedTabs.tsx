import type { ReactNode } from 'react'

export interface SegmentedTabOption<T extends string> {
  value: T
  label: ReactNode
  activeColor?: string
}

interface SegmentedTabsProps<T extends string> {
  options: SegmentedTabOption<T>[]
  value: T
  onChange: (value: T) => void
  fullWidth?: boolean
}

export function SegmentedTabs<T extends string>({ options, value, onChange, fullWidth = false }: SegmentedTabsProps<T>) {
  return (
    <div
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        padding: 3,
        background: 'var(--card-2)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        gap: 3,
      }}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              flex: fullWidth ? 1 : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              padding: '7px 14px',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              border: 'none',
              fontFamily: 'inherit',
              transition: 'all .15s',
              background: active ? 'var(--card)' : 'transparent',
              color: active ? (option.activeColor ?? 'var(--text)') : 'var(--muted)',
              boxShadow: active ? 'var(--shadow)' : 'none',
              position: 'relative',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
