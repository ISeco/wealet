// apps/web/src/features/funds/FundsPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FundFormDrawer } from './components/FundFormDrawer'
import { useFunds } from './hooks'
import type { Fund, FundClassification } from './types'
import { classColor, getFundChip, getInitials } from './utils'

const CLASS_ORDER: FundClassification[] = ['available', 'reserve', 'committed']

const CLASS_DESC: Record<FundClassification, string> = {
  available: 'Para uso diario y gastos operativos',
  reserve: 'Ahorro y colchón de emergencia',
  committed: 'Gastos futuros programados',
}

export function FundsPage() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)

  const { data: funds = [], isLoading } = useFunds()

  const totalBalance = funds.reduce((sum, f) => sum + Number(f.balance), 0)

  const classGroups = CLASS_ORDER.map((cls) => {
    const group = funds.filter((f) => f.classification === cls)
    const total = group.reduce((sum, f) => sum + Number(f.balance), 0)
    return { cls, group, total }
  })

  return (
    <div>
      {/* Classification summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 22 }}>
        {classGroups.map(({ cls, group, total }) => {
          const cl = classColor(cls)
          const formatted = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(total)
          return (
            <div key={cls} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: cl.color }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: cl.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{cl.label}</span>
                <span style={{ fontSize: 11.5, color: 'var(--muted)', marginLeft: 'auto' }}>{group.length}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 10, fontVariantNumeric: 'tabular-nums' }}>
                {isLoading ? '—' : formatted}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{CLASS_DESC[cls]}</div>
            </div>
          )
        })}
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          Tus fondos{' '}
          <span style={{ color: 'var(--muted)', fontWeight: 500 }}>· {funds.length}</span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo fondo
        </button>
      </div>

      {/* Fund grid */}
      {isLoading ? (
        <FundGridSkeleton />
      ) : funds.length === 0 ? (
        <EmptyState onNew={() => setShowForm(true)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16 }}>
          {funds.map((fund) => (
            <FundCard
              key={fund.id}
              fund={fund}
              totalBalance={totalBalance}
              onClick={() => navigate('/fondos/' + fund.id)}
            />
          ))}
        </div>
      )}

      {showForm && <FundFormDrawer onClose={() => setShowForm(false)} />}
    </div>
  )
}

function FundCard({ fund, totalBalance, onClick }: { fund: Fund; totalBalance: number; onClick: () => void }) {
  const chip = getFundChip(fund)
  const cls = classColor(fund.classification)
  const share = totalBalance > 0 ? ((Number(fund.balance) / totalBalance) * 100).toFixed(0) + '%' : '0%'

  return (
    <div
      onClick={onClick}
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: 18, cursor: 'pointer', transition: 'border-color .15s, transform .15s, box-shadow .15s' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--border-strong)'
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = 'var(--shadow-lg)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--border)'
        el.style.transform = ''
        el.style.boxShadow = 'var(--shadow)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, fontFamily: "'Geist Mono', monospace", background: chip.bg, color: chip.color, textTransform: 'uppercase', flexShrink: 0 }}>
          {getInitials(fund.name)}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: chip.bg, color: chip.color }}>
          {cls.label}
        </span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{fund.name}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {CLASS_DESC[fund.classification]}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 14, fontVariantNumeric: 'tabular-nums' }}>
        {fund.balanceFormatted}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 4, background: 'var(--card-2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 4, background: chip.color, width: share }} />
        </div>
        <span style={{ fontSize: 11.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{share}</span>
      </div>
    </div>
  )
}

function FundGridSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16 }}>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, height: 168 }} />
      ))}
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
      <div style={{ fontSize: 14, marginBottom: 12 }}>Todavía no tienes fondos creados.</div>
      <button
        onClick={onNew}
        style={{ height: 36, padding: '0 16px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
      >
        Crear el primer fondo
      </button>
    </div>
  )
}
