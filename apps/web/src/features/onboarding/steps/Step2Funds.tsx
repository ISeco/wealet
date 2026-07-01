import { useState } from 'react'
import type { PresetOption } from './Step1Preset'
import { FundRow } from '../components/FundRow'
import { AddFundForm } from '../components/AddFundForm'
import type { CreateFundPayload, FundClassification } from '../../funds/types'

interface PresetFundDef {
  name: string
  classification: FundClassification
}

const PRESET_FUNDS: Record<Exclude<PresetOption, 'fondos' | 'excel'>, PresetFundDef[]> = {
  jars_eker: [
    { name: 'Necesidades', classification: 'committed' },
    { name: 'Rico', classification: 'available' },
    { name: 'Educación', classification: 'committed' },
    { name: 'Inversión', classification: 'reserve' },
    { name: 'Emergencia', classification: 'reserve' },
    { name: 'Dar', classification: 'available' },
  ],
  '50_30_20': [
    { name: 'Necesidades', classification: 'committed' },
    { name: 'Deseos', classification: 'available' },
    { name: 'Ahorro', classification: 'reserve' },
  ],
  profit_first: [
    { name: 'Estilo de Vida', classification: 'available' },
    { name: 'Diversión / Experiencias', classification: 'available' },
    { name: 'Inversión / Ahorro', classification: 'reserve' },
    { name: 'Seguridad / Impuestos', classification: 'reserve' },
  ],
}

const PRESET_NAMES: Record<Exclude<PresetOption, 'fondos' | 'excel'>, string> = {
  jars_eker: 'Jars of Eker',
  '50_30_20': 'Regla 50/30/20',
  profit_first: 'Profit First',
}

interface Props {
  preset: Exclude<PresetOption, 'excel'>
  customFunds: CreateFundPayload[]
  onAddFund: (fund: CreateFundPayload) => void
  onRemoveFund: (index: number) => void
  error: string | null
}

export function Step2Funds({ preset, customFunds, onAddFund, onRemoveFund, error }: Props) {
  const [showAddForm, setShowAddForm] = useState(false)

  const isPreset = preset !== 'fondos'
  const presetFunds = isPreset ? PRESET_FUNDS[preset as Exclude<PresetOption, 'fondos' | 'excel'>] : []
  const presetName = isPreset ? PRESET_NAMES[preset as Exclude<PresetOption, 'fondos' | 'excel'>] : ''

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Paso 2 · Tus fondos
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', marginTop: 10 }}>
          {isPreset ? presetName : 'Fondos propios'}
        </div>
        <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>
          {isPreset
            ? 'Estos son los fondos que crearemos. Cada uno con su clasificación.'
            : 'Agrega los fondos que quieras. Puedes crear más desde Fondos cuando lo necesites.'}
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isPreset && presetFunds.map((f, i) => (
          <FundRow key={i} name={f.name} classification={f.classification} />
        ))}

        {!isPreset && customFunds.map((f, i) => (
          <FundRow key={i} name={f.name} classification={f.classification} onRemove={() => onRemoveFund(i)} />
        ))}

        {!isPreset && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, border: '1px dashed var(--border-strong)', borderRadius: 12, color: 'var(--muted)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', background: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Agregar fondo
          </button>
        )}

        {!isPreset && showAddForm && (
          <AddFundForm
            onAdd={(fund) => { onAddFund(fund); setShowAddForm(false) }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>

      {error && (
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13.5, color: 'var(--neg)', fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  )
}
