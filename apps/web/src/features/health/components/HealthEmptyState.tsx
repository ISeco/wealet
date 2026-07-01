import { useNavigate } from 'react-router-dom'

type Variant = 'no-funds' | 'no-income'

interface Props {
  variant: Variant
}

export function HealthEmptyState({ variant }: Props) {
  const navigate = useNavigate()

  if (variant === 'no-funds') {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.01em' }}>
          No tienes fondos configurados para este framework
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 8, maxWidth: 340, lineHeight: 1.55 }}>
          Crea fondos para el framework activo o selecciona uno diferente.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            onClick={() => navigate('/onboarding?from=settings')}
            style={{ height: 42, padding: '0 22px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Reconfigurar fondos
          </button>
          <button
            onClick={() => navigate('/fondos')}
            style={{ height: 42, padding: '0 22px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)' }}
          >
            Ir a Fondos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.01em' }}>
        Sin ingresos registrados en este período
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 8, maxWidth: 340, lineHeight: 1.55 }}>
        Registra un ingreso para ver la adherencia a tu framework.
      </div>
      <button
        onClick={() => navigate('/transacciones?action=new')}
        style={{ marginTop: 22, height: 42, padding: '0 22px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)' }}
      >
        Registrar transacción
      </button>
    </div>
  )
}
