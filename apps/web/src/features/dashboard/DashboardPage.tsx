import { HealthCard } from './components/HealthCard'

export function DashboardPage() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
        <PlaceholderCard label="Balance total" />
        <PlaceholderCard label="Ingresos del mes" />
        <PlaceholderCard label="Gastos del mes" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <HealthCard />
        <PlaceholderCard label="Patrimonio neto" tall />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <PlaceholderCard label="Flujo mensual" tall />
        <PlaceholderCard label="Por categoría" tall />
      </div>
    </div>
  )
}

function PlaceholderCard({ label, tall }: { label: string; tall?: boolean }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '20px 24px', minHeight: tall ? 200 : 96, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Próximamente</div>
    </div>
  )
}
