import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api/client'
import { useAuth } from './useAuth'

const MIN_PASSWORD_LENGTH = 8

export function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH
  const passwordError = error ?? (passwordTooShort ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` : null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }

    setSubmitting(true)
    try {
      await register({ email, password, displayName: displayName.trim() || undefined })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos crear tu cuenta. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>Nombre</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 44,
            border: '1px solid var(--border-strong)',
            borderRadius: 9,
            background: 'var(--field)',
            padding: '0 13px',
          }}
        >
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Tu nombre (opcional)"
            maxLength={120}
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)' }}
          />
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>Correo</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 44,
            border: '1px solid var(--border-strong)',
            borderRadius: 9,
            background: 'var(--field)',
            padding: '0 13px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
            <rect x="3" y="5" width="18" height="14" rx="2"></rect>
            <path d="M3 7l9 6 9-6"></path>
          </svg>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)', marginLeft: 10 }}
          />
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>Contraseña</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 44,
            border: `1px solid ${passwordError ? 'var(--neg)' : 'var(--border-strong)'}`,
            borderRadius: 9,
            background: 'var(--field)',
            padding: '0 13px',
            boxShadow: passwordError ? '0 0 0 3px var(--neg-bg)' : 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
            <rect x="4" y="11" width="16" height="9" rx="2"></rect>
            <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
          </svg>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)', marginLeft: 10 }}
          />
          <svg
            onClick={() => setShowPassword((v) => !v)}
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ cursor: 'pointer' }}
          >
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        {passwordError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7, color: 'var(--neg)', fontSize: 12.5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 8v5M12 16h.01"></path>
            </svg>
            <span>{passwordError}</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          height: 46,
          border: 'none',
          borderRadius: 9,
          background: 'var(--grad)',
          color: '#fff',
          fontFamily: 'inherit',
          fontSize: 14.5,
          fontWeight: 600,
          cursor: submitting ? 'default' : 'pointer',
          opacity: submitting ? 0.7 : 1,
          boxShadow: 'var(--shadow)',
          marginTop: 4,
        }}
      >
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  )
}
