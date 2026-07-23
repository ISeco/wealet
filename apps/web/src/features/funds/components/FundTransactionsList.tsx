import type { ReactNode } from 'react'
import type { Category } from '../../categories'
import type { Transaction } from '../../transactions'

interface FundTransactionsListProps {
  transactions: Transaction[]
  categoryMap: Record<string, Category>
  headerRight?: ReactNode
  onTransactionClick?: (transaction: Transaction) => void
}

export function FundTransactionsList({ transactions, categoryMap, headerRight, onTransactionClick }: FundTransactionsListProps) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 12px' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Movimientos</div>
        {headerRight}
      </div>
      {transactions.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', fontSize: 13.5, color: 'var(--muted)' }}>
          Sin movimientos registrados
        </div>
      ) : (
        transactions.map((t) => {
          const isIncome = t.type === 'income'
          const cat = categoryMap[t.categoryId]
          return (
            <div
              key={t.id}
              onClick={onTransactionClick ? () => onTransactionClick(t) : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '11px 24px',
                borderTop: '1px solid var(--border)',
                cursor: onTransactionClick ? 'pointer' : 'default',
              }}
            >
              <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isIncome ? 'var(--pos-bg)' : 'var(--neg-bg)', color: isIncome ? 'var(--pos)' : 'var(--neg)' }}>
                {isIncome ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                )}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.description || cat?.name || (isIncome ? 'Ingreso' : 'Gasto')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {cat?.name && t.description ? `${cat.name} · ` : ''}{t.occurredOn}
                </div>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: isIncome ? 'var(--pos)' : 'inherit', flexShrink: 0 }}>
                {isIncome ? '+' : '−'}{t.amountFormatted}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
