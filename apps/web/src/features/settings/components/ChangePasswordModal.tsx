import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../../../components/ui/Modal'
import { useAuth } from '../../auth'
import { ApiError } from '../../../lib/api/client'
import { useChangePassword } from '../hooks'

interface Props {
  onClose: () => void
}

export function ChangePasswordModal({ onClose }: Props) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useChangePassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }

    try {
      await mutateAsync({ currentPassword, newPassword })
      await logout()
      navigate('/login')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cambiar la contraseña.')
    }
  }

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    height: 42,
    border: '1px solid var(--border-strong)',
    borderRadius: 9,
    background: 'var(--field, var(--card))',
    padding: '0 12px',
    gap: 8,
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    background: 'none',
    outline: 'none',
    fontSize: 13.5,
    color: 'var(--text)',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text)',
    marginBottom: 6,
    display: 'block',
  }

  return (
    <Modal
      title="Cambiar contraseña"
      onClose={onClose}
      width={420}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              height: 38,
              padding: '0 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              fontSize: 13.5,
              color: 'var(--text)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="change-password-form"
            disabled={isPending}
            style={{
              height: 38,
              padding: '0 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--grad)',
              fontSize: 13.5,
              fontWeight: 600,
              color: '#fff',
              cursor: isPending ? 'default' : 'pointer',
              opacity: isPending ? 0.7 : 1,
              fontFamily: 'inherit',
            }}
          >
            {isPending ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </div>
      }
    >
      <form id="change-password-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Contraseña actual</label>
            <div style={fieldStyle}>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Nueva contraseña</label>
            <div style={fieldStyle}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Confirmar nueva contraseña</label>
            <div style={fieldStyle}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>
          </div>
          {error && (
            <p style={{ fontSize: 13, color: 'var(--neg)', margin: 0 }}>{error}</p>
          )}
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
            Al cambiar tu contraseña se cerrará la sesión en todos tus dispositivos.
          </p>
        </div>
      </form>
    </Modal>
  )
}
