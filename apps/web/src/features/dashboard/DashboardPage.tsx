import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { CategoryChart } from './components/CategoryChart'
import { HealthCard } from './components/HealthCard'
import { MonthSelector } from './components/MonthSelector'
import { NetFlowChart } from './components/NetFlowChart'
import { PatrimonioCard } from './components/PatrimonioCard'
import { RecentActivity } from './components/RecentActivity'
import { RunwayCard } from './components/RunwayCard'
import { StatRow } from './components/StatRow'
import { useReportMonths } from './hooks'

function Greeting({ name, month }: { name: string; month: string }) {
  const [, m] = month.split('-')
  const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const monthName = MONTH_NAMES[Number(m) - 1]
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>Hola, {name}</div>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 3 }}>
        Esto es lo que pasó con tu dinero en <b style={{ color: 'var(--text)', fontWeight: 600 }}>{monthName.toLowerCase()}</b>.
      </div>
    </div>
  )
}

function DashboardEmptyState({ onboardingCompleted }: { onboardingCompleted: boolean }) {
  const navigate = useNavigate()

  const content = onboardingCompleted
    ? {
        title: 'Tus fondos están listos',
        subtitle: 'Registra tu primer movimiento para activar el dashboard.',
        primary: { label: 'Nueva transacción', path: '/transacciones' },
        secondary: null,
      }
    : {
        title: 'Todavía no hay datos',
        subtitle: 'Para empezar, crea tus fondos o importa tus datos desde Excel.',
        primary: { label: 'Importar datos', path: '/import' },
        secondary: { label: 'Crear fondo', path: '/fondos' },
      }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 420 }}>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: 'var(--shadow)',
        padding: '48px 40px',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--info-bg)', color: 'var(--info)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
            <polyline points="2 20 22 20" />
          </svg>
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8 }}>
          {content.title}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 28 }}>
          {content.subtitle}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {content.secondary && (
            <button
              onClick={() => navigate(content.secondary!.path)}
              style={{
                padding: '9px 18px', borderRadius: 9, border: '1px solid var(--border-strong)',
                background: 'var(--card)', color: 'var(--text)',
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {content.secondary.label}
            </button>
          )}
          <button
            onClick={() => navigate(content.primary.path)}
            style={{
              padding: '9px 18px', borderRadius: 9, border: 'none',
              background: 'var(--grad)', color: '#fff',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {content.primary.label}
          </button>
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: months = [], isLoading } = useReportMonths()
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const activeMonth = selectedMonth ?? months[0] ?? null

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SkeletonRow cols={2} heights={[160, 160]} />
        <SkeletonRow cols={3} heights={[100, 100, 100]} />
        <SkeletonRow cols={2} heights={[300, 300]} />
      </div>
    )
  }

  if (!activeMonth) {
    return <DashboardEmptyState onboardingCompleted={user?.onboardingCompleted ?? false} />
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <Greeting name={user?.displayName ?? user?.email ?? ''} month={activeMonth} />
        <MonthSelector months={months} value={activeMonth} onChange={setSelectedMonth} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, marginBottom: 16 }}>
        <PatrimonioCard month={activeMonth} />
        <RunwayCard />
      </div>

      <div style={{ marginBottom: 16 }}>
        <StatRow month={activeMonth} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <NetFlowChart />
          <RecentActivity month={activeMonth} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <HealthCard month={activeMonth} />
          <CategoryChart month={activeMonth} />
        </div>
      </div>
    </div>
  )
}

function SkeletonRow({ cols, heights }: { cols: number; heights: number[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
      {heights.map((h, i) => (
        <div key={i} style={{ height: h, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14 }} />
      ))}
    </div>
  )
}
