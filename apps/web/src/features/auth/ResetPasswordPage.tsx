import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { WealetIcon } from '../../components/ui/WealetIcon'
import { PasswordField } from './components/PasswordField'
import { PasswordStrengthChecklist } from './components/PasswordStrengthChecklist'
import { SubmitButton } from './components/SubmitButton'
import { isPasswordStrong } from './components/passwordRules'
import { ApiError } from '../../lib/api/client'
import { resetPassword } from './api'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenInvalid, setTokenInvalid] = useState(false)

  const passwordsMatch = password === confirm
  const canSubmit = isPasswordStrong(password) && passwordsMatch && !!confirm

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 392, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Link inválido</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
            Este link no es válido o ya fue utilizado.
          </div>
          <Link to="/forgot-password" style={{ fontSize: 14, color: 'var(--info)', fontWeight: 600, textDecoration: 'none' }}>
            Solicitar un nuevo link
          </Link>
        </div>
      </div>
    )
  }

  if (tokenInvalid) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 392, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Link expirado</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
            Este link ya expiró o fue utilizado. Los links son válidos por 1 hora.
          </div>
          <Link to="/forgot-password" style={{ fontSize: 14, color: 'var(--info)', fontWeight: 600, textDecoration: 'none' }}>
            Solicitar un nuevo link
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit || !token) return
    setError(null)
    setSubmitting(true)
    try {
      await resetPassword(token, password)
      navigate('/login?reset=ok', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 400) {
        if (err.message.toLowerCase().includes('token')) {
          setTokenInvalid(true)
        } else {
          setError(err.message)
        }
      } else {
        setError('No pudimos restablecer tu contraseña. Intenta de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 392 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <WealetIcon size={34} />
          <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-.02em', color: 'var(--text)' }}>Wealet</span>
        </div>

        <div style={{ fontSize: 25, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', marginBottom: 8 }}>
          Nueva contraseña
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
          Elige una contraseña segura para tu cuenta.
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PasswordField
            label="Nueva contraseña"
            value={password}
            onChange={setPassword}
            onFocus={() => setPasswordTouched(true)}
          />
          {passwordTouched && <PasswordStrengthChecklist password={password} />}

          <PasswordField
            label="Confirmar contraseña"
            value={confirm}
            onChange={setConfirm}
            error={confirm && !passwordsMatch ? 'Las contraseñas no coinciden.' : null}
          />

          {error && (
            <div style={{ fontSize: 13, color: 'var(--neg)', fontWeight: 500 }}>{error}</div>
          )}

          <SubmitButton
            submitting={submitting}
            label="Restablecer contraseña"
            submittingLabel="Restableciendo…"
            disabled={!canSubmit}
          />
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13.5, color: 'var(--muted)' }}>
          <Link to="/login" style={{ color: 'var(--info)', fontWeight: 600, textDecoration: 'none' }}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
