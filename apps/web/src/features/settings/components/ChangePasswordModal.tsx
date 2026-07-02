import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { useAuth } from '../../auth'
import { ApiError } from '../../../lib/api/client'
import { useChangePassword } from '../hooks'

interface Props {
  onClose: () => void
}

export function ChangePasswordModal({ onClose }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useChangePassword()

  const hasPassword = user?.hasPassword ?? true
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
      await mutateAsync({
        ...(hasPassword ? { currentPassword } : {}),
        newPassword,
      })
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

  const title = hasPassword ? 'Cambiar contraseña' : 'Establecer contraseña'
  const submitLabel = hasPassword ? 'Cambiar contraseña' : 'Establecer contraseña'

  return (
    <Modal
      title={title}
      onClose={onClose}
      width={420}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            style={{ height: 38, padding: '0 16px', fontSize: 13.5 }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="change-password-form"
            disabled={isPending}
            style={{ height: 38, padding: '0 16px', fontSize: 13.5 }}
          >
            {isPending ? 'Guardando…' : submitLabel}
          </Button>
        </div>
      }
    >
      <form id="change-password-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {hasPassword && (
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
          )}
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
            Al {hasPassword ? 'cambiar' : 'establecer'} tu contraseña se cerrará la sesión en todos tus dispositivos.
          </p>
        </div>
      </form>
    </Modal>
  )
}
