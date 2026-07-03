import { useState } from 'react'
import { formatThousands } from '../../../lib/money'

interface Props {
  rawAmount: string
  onChange: (value: string) => void
}

export function Step3Income({ rawAmount, onChange }: Props) {
  const [focused, setFocused] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value.replace(/\D/g, ''))
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        Paso 3 · Ingreso
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', marginTop: 10 }}>
        ¿Cuánto recibes mensualmente?
      </div>
      <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8, maxWidth: 440, margin: '8px auto 0', lineHeight: 1.55 }}>
        Lo usamos para calcular tus metas en Salud financiera. Puedes ajustarlo cuando quieras.
      </div>

      <div style={{ maxWidth: 340, margin: '32px auto 0' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: 72,
          border: `1.5px solid ${focused ? 'var(--disp)' : 'var(--border-strong)'}`,
          borderRadius: 14,
          background: 'var(--field)',
          padding: '0 22px',
          transition: 'border-color .15s',
          boxShadow: focused ? '0 0 0 3px rgba(22,168,154,.12)' : 'none',
        }}>
          <span style={{ fontSize: 32, fontWeight: 500, color: 'var(--muted)', marginRight: 8 }}>$</span>
          <input
            autoFocus
            type="text"
            inputMode="numeric"
            value={formatThousands(rawAmount)}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="0"
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: 32,
              fontWeight: 600,
              color: 'var(--text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Ingreso neto mensual en CLP
        </div>
      </div>
    </div>
  )
}
