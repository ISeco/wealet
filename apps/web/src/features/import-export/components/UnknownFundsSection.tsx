import { useState } from 'react'

interface Props {
  unknownFunds: string[]
  approvedFunds: Set<string>
  onToggle: (name: string) => void
}

const VISIBLE_LIMIT = 3

export function UnknownFundsSection({ unknownFunds, approvedFunds, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? unknownFunds : unknownFunds.slice(0, VISIBLE_LIMIT)
  const hiddenCount = unknownFunds.length - VISIBLE_LIMIT

  return (
    <div
      style={{
        background: 'var(--warn-bg)',
        border: '1px solid var(--warn)',
        borderRadius: 12,
        padding: '14px 18px',
        marginTop: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          Fondos nuevos detectados
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>
        Estas filas crearán fondos que aún no existen en tu cuenta. Desmarca los que no quieras crear — esas filas no se importarán.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
        {visible.map((name) => (
          <label
            key={name}
            style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13.5, fontWeight: 500 }}
          >
            <input
              type="checkbox"
              checked={approvedFunds.has(name)}
              onChange={() => onToggle(name)}
              style={{ accentColor: 'var(--warn)', width: 15, height: 15 }}
            />
            {name}
          </label>
        ))}
      </div>
      {unknownFunds.length > VISIBLE_LIMIT && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            marginTop: 10,
            background: 'none',
            border: 'none',
            color: 'var(--warn)',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
          }}
        >
          {expanded ? 'Ver menos ↑' : `Ver ${hiddenCount} más ↓`}
        </button>
      )}
    </div>
  )
}
