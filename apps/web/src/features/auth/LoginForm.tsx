import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api/client'
import { EmailField } from './components/EmailField'
import { PasswordField } from './components/PasswordField'
import { SubmitButton } from './components/SubmitButton'
import { useAuth } from './useAuth'

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
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
      <EmailField value={email} onChange={setEmail} />

      <PasswordField value={password} onChange={setPassword} error={error} />

      <SubmitButton submitting={submitting} label="Iniciar sesión" submittingLabel="Iniciando sesión…" />
    </form>
  )
}
