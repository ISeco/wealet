import { useNavigate } from 'react-router-dom'
import { formatMoney } from '../../../lib/money'
import type { ActivityItem } from '../../transactions/types'
import { useRecentActivity } from '../hooks'

function itemIcon(item: ActivityItem): { bg: string; color: string; svg: React.ReactNode } {
  if (item.type === 'transfer') {
    return {
      bg: 'var(--info-bg)', color: 'var(--info)',
      svg: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
    }
  }
  if (item.subtype === 'income') {
    return {
      bg: 'var(--pos-bg)', color: 'var(--pos)',
      svg: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
        </svg>
      ),
    }
  }
  return {
    bg: 'var(--neg-bg)', color: 'var(--neg)',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
      </svg>
    ),
  }
}

function itemLabel(item: ActivityItem): string {
  if (item.type === 'transfer') return item.note ?? 'Transferencia'
  return item.description ?? 'Sin descripción'
}

function itemMeta(item: ActivityItem): string {
  const date = new Date(item.occurredOn).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  return item.type === 'transfer' ? `Transferencia · ${date}` : date
}

function itemAmountColor(item: ActivityItem): string {
  if (item.type === 'transfer') return 'var(--info)'
  return item.subtype === 'income' ? 'var(--pos)' : 'var(--neg)'
}

function itemAmountPrefix(item: ActivityItem): string {
  if (item.type === 'transfer') return ''
  return item.subtype === 'income' ? '+' : '−'
}

export function RecentActivity() {
  const navigate = useNavigate()
  const { data } = useRecentActivity()
  const items = data?.data ?? []

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 14px' }}>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>Movimientos recientes</div>
        <span
          onClick={() => navigate('/transacciones')}
          style={{ fontSize: 12.5, color: 'var(--info)', fontWeight: 600, cursor: 'pointer' }}
        >
          Ver todos
        </span>
      </div>

      {items.map((item) => {
        const { bg, color, svg } = itemIcon(item)
        return (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 24px', borderTop: '1px solid var(--border)' }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color }}>
              {svg}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {itemLabel(item)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>
                {itemMeta(item)}
              </div>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: itemAmountColor(item) }}>
              {itemAmountPrefix(item)}{formatMoney(item.amount, item.currency)}
            </div>
          </div>
        )
      })}

      {items.length === 0 && (
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', fontSize: 13.5, color: 'var(--muted)' }}>
          Sin movimientos recientes.
        </div>
      )}
    </div>
  )
}
