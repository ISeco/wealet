import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { WealetIcon } from '../../components/ui/WealetIcon'
import { EmailField } from './components/EmailField'
import { SubmitButton } from './components/SubmitButton'
import { forgotPassword } from './api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setNetworkError(null)
    setSubmitting(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setNetworkError('No pudimos enviar el correo. Intenta de nuevo.')
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

        {sent ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Revisa tu correo</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Si <strong style={{ color: 'var(--text)' }}>{email}</strong> está registrado, recibirás un link para restablecer tu contraseña en los próximos minutos.
            </div>
            <Link to="/login" style={{ fontSize: 14, color: 'var(--info)', fontWeight: 600, textDecoration: 'none' }}>
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 25, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', marginBottom: 8 }}>
              ¿Olvidaste tu contraseña?
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
              Ingresa tu correo y te enviaremos un link para restablecerla.
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <EmailField
                value={email}
                onChange={setEmail}
                error={null}
              />
              {networkError && (
                <div style={{ fontSize: 13, color: 'var(--neg)', fontWeight: 500 }}>{networkError}</div>
              )}
              <SubmitButton submitting={submitting} label="Enviar instrucciones" submittingLabel="Enviando…" />
            </form>

            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13.5, color: 'var(--muted)' }}>
              <Link to="/login" style={{ color: 'var(--info)', fontWeight: 600, textDecoration: 'none' }}>
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
