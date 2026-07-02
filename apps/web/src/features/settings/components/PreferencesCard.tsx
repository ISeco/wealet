import { useState } from 'react'
import { Select } from '../../../components/ui/Select'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useActivateFramework, useHealthProfile } from '../../health/hooks'
import { ALL_FRAMEWORKS, FRAMEWORK_LABELS } from '../../health/utils'
import { card, settingsRow } from '../styles'
import type { HealthFramework } from '../../health/types'

const FRAMEWORK_OPTIONS = ALL_FRAMEWORKS.map((value) => ({ value, label: FRAMEWORK_LABELS[value] }))

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
          options={FRAMEWORK_OPTIONS}
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
            currentFramework === 'fondos' ? (
              <>
                Tus fondos propios no se ven afectados. Se activarán los fondos de{' '}
                <strong>{FRAMEWORK_LABELS[pendingFramework]}</strong> y se mostrarán junto a los tuyos en Fondos y
                Salud financiera.
              </>
            ) : (
              <>
                Los fondos de <strong>{FRAMEWORK_LABELS[currentFramework]}</strong> se archivarán: tu historial y
                saldo se conservan, pero dejarán de verse en Fondos y Salud financiera. Si vuelves a{' '}
                <strong>{FRAMEWORK_LABELS[currentFramework]}</strong> más adelante, se reactivan automáticamente con
                su historial intacto.
              </>
            )
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
