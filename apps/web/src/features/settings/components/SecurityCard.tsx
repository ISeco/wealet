import { useState } from 'react'
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
        <div style={{ ...settingsRow, borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Contraseña</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              {user?.hasPassword ? 'Última actualización desconocida' : 'No tienes contraseña configurada'}
            </div>
          </div>
          <button onClick={() => setShowModal(true)} style={rowBtn}>
            {passwordLabel}
          </button>
        </div>
        <div style={settingsRow}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Correo electrónico</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{user?.email}</div>
          </div>
          <button disabled style={{ ...rowBtn, opacity: 0.5, cursor: 'not-allowed' }}>
            Próximamente
          </button>
        </div>
      </div>
      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}
    </>
  )
}

const rowBtn: React.CSSProperties = {
  height: 38,
  padding: '0 14px',
  border: '1px solid var(--border)',
  borderRadius: 9,
  background: 'var(--card)',
  fontSize: 13.5,
  fontWeight: 500,
  color: 'var(--text)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
}
