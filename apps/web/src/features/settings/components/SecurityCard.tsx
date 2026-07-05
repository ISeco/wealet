import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { useAuth } from '../../auth'
import { card, settingsRow } from '../styles'
import { ChangePasswordModal } from './ChangePasswordModal'

export function SecurityCard() {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)

  const passwordLabel = user?.hasPassword ? 'Cambiar contraseña' : 'Establecer contraseña'

  return (
    <>
      <div style={card}>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>Seguridad</div>
        <div
          className="settings-row--stack-narrow"
          style={{ ...settingsRow, borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Contraseña</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              {user?.hasPassword ? 'Última actualización desconocida' : 'No tienes contraseña configurada'}
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowModal(true)}
            style={{ height: 38, fontSize: 13.5, whiteSpace: 'nowrap' }}
          >
            {passwordLabel}
          </Button>
        </div>
        <div className="settings-row--stack-narrow" style={settingsRow}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Correo electrónico</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{user?.email}</div>
          </div>
          <Button
            variant="secondary"
            disabled
            style={{ height: 38, fontSize: 13.5, whiteSpace: 'nowrap' }}
          >
            Próximamente
          </Button>
        </div>
      </div>
      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}
    </>
  )
}
