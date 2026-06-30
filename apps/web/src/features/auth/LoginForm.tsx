import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api/client'
import { useFormFieldErrors } from '../../lib/useFormFieldErrors'
import { EmailField } from './components/EmailField'
import { PasswordField } from './components/PasswordField'
import { SubmitButton } from './components/SubmitButton'
import { useAuth } from './useAuth'

const FIELDS = ['email', 'password'] as const

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { fieldErrors, register, clearFieldError, validate } = useFormFieldErrors(FIELDS)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const isValid = validate({
      email: !email.trim(),
      password: !password,
    })
    if (!isValid) return

    setSubmitting(true)
    try {
      await login({ email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos iniciar sesión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <EmailField
        ref={register('email')}
        value={email}
        onChange={(value) => {
          setEmail(value)
          clearFieldError('email')
        }}
        error={fieldErrors.email ? 'Ingresa tu correo.' : null}
      />

      <PasswordField
        ref={register('password')}
        value={password}
        onChange={(value) => {
          setPassword(value)
          clearFieldError('password')
        }}
        error={fieldErrors.password ? 'Ingresa tu contraseña.' : error}
      />

      <div style={{ textAlign: 'right', marginTop: -8 }}>
        <Link
          to="/forgot-password"
          style={{ fontSize: 13, color: 'var(--info)', textDecoration: 'none', fontWeight: 500 }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <SubmitButton submitting={submitting} label="Iniciar sesión" submittingLabel="Iniciando sesión…" />
    </form>
  )
}
