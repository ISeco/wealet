import { useState, useRef, useEffect, forwardRef, type CSSProperties } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  placeholder?: string
  value?: string
  onChange?: (event: { target: { value: string } }) => void
  style?: CSSProperties
  required?: boolean
  disabled?: boolean
  error?: boolean
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { label, options, placeholder, value = '', onChange, style, disabled, error },
  ref,
) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)
  const isEmpty = !selected

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function handleSelect(optionValue: string) {
    onChange?.({ target: { value: optionValue } })
    setOpen(false)
  }

  const triggerStyle: CSSProperties = {
    width: '100%',
    height: 40,
    border: `1px solid ${error ? 'var(--neg)' : 'var(--border-strong)'}`,
    borderRadius: 9,
    background: 'var(--field)',
    padding: '0 12px',
    fontFamily: 'inherit',
    fontSize: 13.5,
    color: isEmpty ? 'var(--muted)' : 'var(--text)',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    opacity: disabled ? 0.5 : 1,
    ...style,
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>{label}</div>
      )}

      <button ref={ref} type="button" onClick={() => !disabled && setOpen((o) => !o)} style={triggerStyle}>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
          {selected?.label ?? placeholder ?? ''}
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flex: 'none', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            background: 'var(--card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 220,
            overflowY: 'auto',
            padding: 4,
          }}
        >
          {placeholder && (
            <div
              onClick={() => handleSelect('')}
              style={{
                padding: '8px 10px',
                borderRadius: 7,
                fontSize: 13.5,
                cursor: 'pointer',
                color: 'var(--muted)',
                background: isEmpty ? 'var(--tint)' : 'transparent',
              }}
            >
              {placeholder}
            </div>
          )}
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 7,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--tint)' : 'transparent',
                  color: isSelected ? 'var(--text)' : 'var(--text)',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {option.label}
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})
