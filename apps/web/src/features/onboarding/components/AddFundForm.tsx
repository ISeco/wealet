import { useState } from 'react'
import type { FundClassification, CreateFundPayload } from '../../funds/types'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select'

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
      <Select
        options={CLASSIFICATIONS.map((c) => ({ value: c.value, label: c.label }))}
        value={classification}
        onChange={(e) => setClassification(e.target.value as FundClassification)}
        style={{ width: 160, height: 38 }}
      />
      <Button type="submit" size="sm" disabled={!name.trim()}>
        Agregar
      </Button>
      <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
        Cancelar
      </Button>
    </form>
  )
}
