import { useState } from 'react'
import { Select } from '../../../components/ui/Select'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useActivateFramework, useHealthProfile } from '../../health/hooks'
import { card, settingsRow } from '../styles'
import type { HealthFramework } from '../../health/types'

const FRAMEWORKS = [
  { value: '50_30_20', label: 'Regla 50 / 30 / 20' },
  { value: 'jars_eker', label: 'Jars of Eker' },
  { value: 'profit_first', label: 'Profit First' },
  { value: 'fondos', label: 'Fondos' },
]

const FRAMEWORK_LABEL: Record<HealthFramework, string> = {
  '50_30_20': 'Regla 50 / 30 / 20',
  jars_eker: 'Jars of Eker',
  profit_first: 'Profit First',
  fondos: 'Fondos',
}

export function PreferencesCard() {
  const { data: healthProfile } = useHealthProfile()
  const { mutate: activateFramework, isPending } = useActivateFramework()
  const [pendingFramework, setPendingFramework] = useState<HealthFramework | null>(null)

  const currentFramework = healthProfile?.framework ?? 'fondos'

  function handleConfirm() {
    if (!pendingFramework) return
    activateFramework(pendingFramework)
    setPendingFramework(null)
  }

  return (
    <div style={card}>
      <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>Preferencias</div>
      <div style={{ ...settingsRow, borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Framework por defecto</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>El que se muestra en Salud financiera</div>
        </div>
        <Select
          options={FRAMEWORKS}
          value={currentFramework}
          onChange={(e) => setPendingFramework(e.target.value as HealthFramework)}
          style={{ width: 190 }}
        />
      </div>
      <div style={settingsRow}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Moneda</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Peso chileno · sin decimales</div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 38,
            padding: '0 14px',
            border: '1px solid var(--border)',
            borderRadius: 9,
            fontSize: 13.5,
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--text)',
          }}
        >
          CLP · $1.234.567
        </div>
      </div>

      {pendingFramework && (
        <ConfirmDialog
          title="Vas a cambiar de framework"
          description={
            <>
              Los fondos de <strong>{FRAMEWORK_LABEL[currentFramework]}</strong> se archivarán: tu historial y saldo
              se conservan, pero dejarán de verse en Fondos y Salud financiera. Si vuelves a{' '}
              <strong>{FRAMEWORK_LABEL[currentFramework]}</strong> más adelante, se reactivan automáticamente con su
              historial intacto.
            </>
          }
          confirmLabel="Cambiar framework"
          isPending={isPending}
          onConfirm={handleConfirm}
          onClose={() => setPendingFramework(null)}
        />
      )}
    </div>
  )
}
