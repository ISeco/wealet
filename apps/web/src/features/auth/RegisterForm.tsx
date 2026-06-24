import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api/client'
import { EmailField } from './components/EmailField'
import { FieldError } from './components/FieldError'
import { PasswordField } from './components/PasswordField'
import { PasswordStrengthChecklist } from './components/PasswordStrengthChecklist'
import { isPasswordStrong } from './components/passwordRules'
import { SubmitButton } from './components/SubmitButton'
import { TextField } from './components/TextField'
import { useAuth } from './useAuth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const passwordValid = isPasswordStrong(password)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const trimmedDisplayName = displayName.trim()
    const nameInvalid = trimmedDisplayName.length === 0
    const emailInvalid = !EMAIL_REGEX.test(email)

    setDisplayNameError(nameInvalid ? 'Ingresa tu nombre.' : null)
    setEmailError(emailInvalid ? 'Ingresa un correo válido.' : null)
    setPasswordTouched(true)

    if (nameInvalid || emailInvalid || !passwordValid) {
      return
    }

    setSubmitting(true)
    try {
      await register({ email, password, displayName: trimmedDisplayName })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos crear tu cuenta. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TextField
        label="Nombre"
        required
        placeholder="Tu nombre"
        maxLength={120}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        error={displayNameError}
      />

      <EmailField
        value={email}
        onChange={setEmail}
        onBlur={() => setEmailError(email.length > 0 && !EMAIL_REGEX.test(email) ? 'Ingresa un correo válido.' : null)}
        error={emailError}
      />

      <div>
        <PasswordField
          value={password}
          onChange={setPassword}
          onFocus={() => setPasswordTouched(true)}
          maxLength={72}
          invalid={passwordTouched && !passwordValid}
        />
        {passwordTouched && <PasswordStrengthChecklist password={password} />}
      </div>

      {error && <FieldError message={error} marginTop={0} />}

      <SubmitButton submitting={submitting} label="Crear cuenta" submittingLabel="Creando cuenta…" />
    </form>
  )
}
