import { useState } from 'react'
import type { FundClassification, CreateFundPayload } from '../../funds/types'

const CLASSIFICATIONS: { value: FundClassification; label: string }[] = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserve', label: 'Reserva' },
  { value: 'committed', label: 'Comprometido' },
]

interface Props {
  onAdd: (fund: CreateFundPayload) => void
  onCancel: () => void
}

export function AddFundForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [classification, setClassification] = useState<FundClassification>('available')

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, classification })
    setName('')
    setClassification('available')
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--tint)', display: 'flex', gap: 10, alignItems: 'center' }}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del fondo"
        maxLength={120}
        style={{ flex: 1, height: 38, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--field)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }}
      />
      <select
        value={classification}
        onChange={(e) => setClassification(e.target.value as FundClassification)}
        style={{ height: 38, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--field)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13.5 }}
      >
        {CLASSIFICATIONS.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!name.trim()}
        style={{ height: 38, padding: '0 16px', border: 'none', borderRadius: 9, background: 'var(--disp)', color: '#fff', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: name.trim() ? 'pointer' : 'not-allowed', opacity: name.trim() ? 1 : 0.5 }}
      >
        Agregar
      </button>
      <button
        type="button"
        onClick={onCancel}
        style={{ height: 38, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--card)', color: 'var(--muted)', fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer' }}
      >
        Cancelar
      </button>
    </form>
  )
}
