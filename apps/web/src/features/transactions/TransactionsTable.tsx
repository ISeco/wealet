import { useState } from 'react'
import type { Fund } from '../funds'
import type { Category } from '../categories'
import type { Transaction } from './types'
import type { Transfer } from '../transfers/types'

export type TableRow =
  | { kind: 'transaction'; data: Transaction }
  | { kind: 'transfer'; data: Transfer }

interface TransactionsTableProps {
  rows: TableRow[]
  funds: Fund[]
  categories: Category[]
  onRowClick: (transaction: Transaction) => void
  onReassign: (transactionId: string, newFundId: string) => void
}

const COLUMNS = '84px 1fr 168px 150px 132px'

const MONTH_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-')
  return `${parseInt(day)} ${MONTH_ABBR[parseInt(month) - 1]}`
}

export function TransactionsTable({ rows, funds, categories, onRowClick, onReassign }: TransactionsTableProps) {
  const [reassignOpenId, setReassignOpenId] = useState<string | null>(null)

  const fundsById = new Map(funds.map((f) => [f.id, f]))
  const categoriesById = new Map(categories.map((c) => [c.id, c]))

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'visible' }}>
      {/* header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: COLUMNS,
          gap: 12,
          padding: '11px 22px',
          borderBottom: '1px solid var(--border)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
        }}
      >
        <div>Fecha</div>
        <div>Descripción</div>
        <div>Fondo</div>
        <div>Categoría</div>
        <div style={{ textAlign: 'right' }}>Monto</div>
      </div>

      {rows.length === 0 && (
        <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
          No hay movimientos para los filtros seleccionados.
        </div>
      )}

      {rows.map((row) => {
        if (row.kind === 'transfer') {
          const t = row.data
          const fromFund = fundsById.get(t.fromFundId)
          const toFund = fundsById.get(t.toFundId)
          const fundLabel = fromFund && toFund ? `${fromFund.name} → ${toFund.name}` : '—'

          return (
            <div
              key={t.id}
              style={{
                display: 'grid',
                gridTemplateColumns: COLUMNS,
                gap: 12,
                alignItems: 'center',
                padding: '12px 22px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 12.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                {formatDate(t.occurredOn)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    flex: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--info-bg)',
                    color: 'var(--info)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 9l-3 3 3 3M2 12h13M19 15l3-3-3-3M22 12H9" />
                  </svg>
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.note || 'Transferencia'}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {fundLabel}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, flex: 'none', background: 'var(--info)' }} />
                <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Transferencia</span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--info)' }}>
                {t.amountFormatted}
              </div>
            </div>
          )
        }

        const t = row.data
        const fund = fundsById.get(t.fundId)
        const category = categoriesById.get(t.categoryId)
        const isIncome = t.type === 'income'
        const isReassignOpen = reassignOpenId === t.id

        return (
          <div
            key={t.id}
            onClick={() => onRowClick(t)}
            style={{
              display: 'grid',
              gridTemplateColumns: COLUMNS,
              gap: 12,
              alignItems: 'center',
              padding: '12px 22px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 12.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
              {formatDate(t.occurredOn)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isIncome ? 'var(--pos-bg)' : 'var(--neg-bg)',
                  color: isIncome ? 'var(--pos)' : 'var(--neg)',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {isIncome ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                )}
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.description || category?.name || '—'}
              </span>
            </div>

            {/* fondo column con reassign */}
            <div
              style={{ position: 'relative', minWidth: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span
                onClick={() => setReassignOpenId(isReassignOpen ? null : t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  maxWidth: '100%',
                  fontSize: 12.5,
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  marginLeft: -8,
                  borderRadius: 7,
                }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fund?.name ?? '—'}
                </span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', opacity: 0.6 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>

              {isReassignOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 34,
                    left: -8,
                    zIndex: 40,
                    width: 228,
                    background: 'var(--card)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 12,
                    boxShadow: 'var(--shadow-lg)',
                    padding: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px 8px', fontSize: 11, fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 9l-3 3 3 3M2 12h13M19 15l3-3-3-3M22 12H9" />
                    </svg>
                    Mover a otro fondo
                  </div>
                  {funds.map((f) => {
                    const isCurrent = f.id === t.fundId
                    return (
                      <div
                        key={f.id}
                        onClick={() => {
                          if (!isCurrent) onReassign(t.id, f.id)
                          setReassignOpenId(null)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 9px',
                          borderRadius: 8,
                          cursor: isCurrent ? 'default' : 'pointer',
                          fontSize: 13,
                          background: isCurrent ? 'var(--card-2)' : 'transparent',
                          color: isCurrent ? 'var(--text)' : 'var(--muted)',
                          fontWeight: isCurrent ? 600 : 400,
                        }}
                      >
                        {f.name}
                        {isCurrent && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, flex: 'none', background: category?.color ?? 'var(--muted)' }} />
              <span style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{category?.name ?? '—'}</span>
            </div>

            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
                color: isIncome ? 'var(--pos)' : 'var(--neg)',
              }}
            >
              {isIncome ? '+' : '−'}{t.amountFormatted}
            </div>
          </div>
        )
      })}
    </div>
  )
}
