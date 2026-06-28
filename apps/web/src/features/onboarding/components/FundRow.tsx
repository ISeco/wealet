import type { FundClassification } from '../../funds/types'

const CLASSIFICATION_LABEL: Record<FundClassification, string> = {
  available: 'Disponible',
  reserve: 'Reserva',
  committed: 'Comprometido',
}

const CLASSIFICATION_STYLE: Record<FundClassification, { bg: string; color: string }> = {
  available: { bg: 'var(--disp-bg)', color: 'var(--disp)' },
  reserve: { bg: 'var(--res-bg)', color: 'var(--res)' },
  committed: { bg: 'var(--comp-bg)', color: 'var(--comp)' },
}

interface Props {
  name: string
  classification: FundClassification
  onRemove?: () => void
}

export function FundRow({ name, classification, onRemove }: Props) {
  const style = CLASSIFICATION_STYLE[classification]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)' }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: style.bg, color: style.color }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 8l9 5 9-5" />
        </svg>
      </span>
      <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{name}</div>
      <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 7, background: style.bg, color: style.color }}>
        {CLASSIFICATION_LABEL[classification]}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{ border: 'none', background: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, lineHeight: 0 }}
          aria-label="Eliminar fondo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  )
}
