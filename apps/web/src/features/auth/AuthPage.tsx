import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { Button } from '../../components/ui/Button'
import { WealetIcon } from '../../components/ui/WealetIcon'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { useAuth } from './useAuth'

interface AuthPageProps {
  mode: 'login' | 'register'
}

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === 'login'
  const [searchParams] = useSearchParams()
  const passwordReset = isLogin && searchParams.get('reset') === 'ok'

  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [googleError, setGoogleError] = useState<string | null>(null)

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleError(null)
        await loginWithGoogle(tokenResponse.access_token)
        navigate('/', { replace: true })
      } catch {
        setGoogleError('Error al iniciar sesión con Google. Intenta de nuevo.')
      }
    },
    onError: () => {
      setGoogleError('Error al iniciar sesión con Google. Intenta de nuevo.')
    },
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <div
        style={{
          flex: 1.05,
          background: 'var(--navy)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 56px',
          position: 'relative',
          overflow: 'hidden',
          minWidth: 380,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(760px 520px at 82% -12%,rgba(31,169,224,.32),transparent 58%),radial-gradient(680px 580px at -12% 112%,rgba(107,191,63,.20),transparent 55%)',
          }}
        ></div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <WealetIcon size={44} />
          <div style={{ fontWeight: 600, fontSize: 21, letterSpacing: '-.02em' }}>Wealet</div>
        </div>
        <div style={{ position: 'relative', maxWidth: 440 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>
            Wealth + Wallet
          </div>
          <div style={{ fontSize: 38, lineHeight: 1.16, fontWeight: 600, letterSpacing: '-.025em', margin: '16px 0 0' }}>
            Gestiona el día a día y construye patrimonio.
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,.72)', marginTop: 18 }}>
            Organiza tu dinero en fondos con propósito. Mira tu runway, tu patrimonio neto y a dónde va cada peso.
          </div>
        </div>
        <div style={{ position: 'relative', fontSize: 12.5, color: 'rgba(255,255,255,.42)' }}>© 2026 Wealet · Hecho en Chile · CLP</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 392 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30 }}>
            <WealetIcon size={34} />
            <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-.02em', color: 'var(--text)' }}>Wealet</span>
          </div>
          <div style={{ fontSize: 25, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)' }}>
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>
            {isLogin ? 'Ingresa tus datos para continuar.' : 'Regístrate para empezar a organizar tus fondos.'}
          </div>

          <div style={{ display: 'flex', padding: 3, background: 'var(--card-2)', border: '1px solid var(--border)', borderRadius: 10, gap: 3, margin: '22px 0' }}>
            <Link
              to="/login"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: 8,
                borderRadius: 7,
                fontSize: 13.5,
                cursor: 'pointer',
                textDecoration: 'none',
                background: isLogin ? 'var(--card)' : 'transparent',
                color: isLogin ? 'var(--text)' : 'var(--muted)',
                boxShadow: isLogin ? 'var(--shadow)' : 'none',
                fontWeight: isLogin ? 600 : 500,
              }}
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: 8,
                borderRadius: 7,
                fontSize: 13.5,
                cursor: 'pointer',
                textDecoration: 'none',
                background: !isLogin ? 'var(--card)' : 'transparent',
                color: !isLogin ? 'var(--text)' : 'var(--muted)',
                boxShadow: !isLogin ? 'var(--shadow)' : 'none',
                fontWeight: !isLogin ? 600 : 500,
              }}
            >
              Crear cuenta
            </Link>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => handleGoogleLogin()}
            style={{ width: '100%', height: 44, border: '1px solid var(--border-strong)', fontWeight: 500 }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-7.8z" />
              <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1-3.6 1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M6 14.3a6.6 6.6 0 0 1 0-4.2V7.3H2.3a11 11 0 0 0 0 9.8z" />
              <path fill="#EA4335" d="M12 5.5c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.3L6 10.1c.9-2.6 3.2-4.6 6-4.6z" />
            </svg>
            Continuar con Google
          </Button>
          {googleError && (
            <p style={{ fontSize: 13, color: 'var(--neg)', margin: '8px 0 0', textAlign: 'center' }}>
              {googleError}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>o con tu correo</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          </div>

          {passwordReset && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--pos-bg)', border: '1px solid var(--pos)', borderRadius: 10, marginBottom: 16, fontSize: 13.5, color: 'var(--pos)', fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Contraseña actualizada. Ya puedes iniciar sesión.
            </div>
          )}

          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--muted)', marginTop: 22 }}>
            {isLogin ? (
              <>
                ¿No tienes cuenta?{' '}
                <Link to="/register" style={{ color: 'var(--info)', fontWeight: 600, textDecoration: 'none' }}>
                  Crear cuenta
                </Link>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" style={{ color: 'var(--info)', fontWeight: 600, textDecoration: 'none' }}>
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
