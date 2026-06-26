import { forwardRef, useRef, useImperativeHandle } from 'react'

interface DateInputProps {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  error?: boolean
  style?: React.CSSProperties
}

function formatDateDisplay(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput({ label, value, onChange, required, error, style }, ref) {
    const inputRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => inputRef.current!)

    function handleClick() {
      inputRef.current?.showPicker()
    }

    return (
      <div>
        {label && (
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>
            {label}
          </div>
        )}
        <div
          onClick={handleClick}
          style={{
            height: 44,
            border: `1px solid ${error ? 'var(--neg)' : 'var(--border)'}`,
            borderRadius: 10,
            background: 'var(--field)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 8,
            cursor: 'pointer',
            ...style,
          }}
        >
          <span style={{ flex: 1, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: value ? 'var(--text)' : 'var(--muted)', pointerEvents: 'none' }}>
            {value ? formatDateDisplay(value) : 'Selecciona una fecha'}
          </span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="16" y1="2" x2="16" y2="6" />
          </svg>
          <input
            ref={inputRef}
            type="date"
            value={value}
            onChange={onChange}
            required={required}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          />
        </div>
      </div>
    )
  },
)
