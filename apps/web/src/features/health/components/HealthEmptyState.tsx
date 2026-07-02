import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'

type Variant = 'no-funds' | 'no-income'

interface Props {
  variant: Variant
}

interface Action {
  label: string
  to: string
  variant: 'primary' | 'secondary'
}

const CONTENT: Record<Variant, {
  icon: ReactElement
  title: string
  description: string
  actions: Action[]
}> = {
  'no-funds': {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    title: 'No tienes fondos configurados para este framework',
    description: 'Crea fondos para el framework activo o selecciona uno diferente.',
    actions: [
      { label: 'Reconfigurar fondos', to: '/onboarding?from=settings', variant: 'secondary' },
      { label: 'Ir a Fondos', to: '/fondos', variant: 'primary' },
    ],
  },
  'no-income': {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Sin ingresos registrados en este período',
    description: 'Registra un ingreso para ver la adherencia a tu framework.',
    actions: [
      { label: 'Registrar transacción', to: '/transacciones?action=new', variant: 'primary' },
    ],
  },
}

export function HealthEmptyState({ variant }: Props) {
  const navigate = useNavigate()
  const { icon, title, description, actions } = CONTENT[variant]

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.01em' }}>
        {title}
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 8, maxWidth: 340, lineHeight: 1.55 }}>
        {description}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        {actions.map((action) => (
          <Button
            key={action.to}
            variant={action.variant}
            onClick={() => navigate(action.to)}
            style={{ height: 42, padding: '0 22px' }}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
