import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Pagination } from '../../../components/ui/Pagination'
import { formatMoney } from '../../../lib/money'
import type { ImportPreviewResponseDto } from '../types'
import { rowBadge, rowOpacity } from '../importFlow.utils'
import { UnknownFundsSection } from './UnknownFundsSection'

const PAGE_SIZE = 25

interface Props {
  previewData: ImportPreviewResponseDto
  approvedFunds: Set<string>
  onToggleFund: (name: string) => void
  onBack: () => void
  onConfirm: () => void
  isPending: boolean
  error?: string | null
}

export function PreviewStep({ previewData, approvedFunds, onToggleFund, onBack, onConfirm, isPending, error }: Props) {
  const { rows, unknownFunds, errors } = previewData
  const [page, setPage] = useState(0)
  const sortedRows = [...rows].sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE)
  const visibleRows = sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const validCount = rows.filter((r) => !r.duplicate).length
  const duplicateCount = rows.filter((r) => r.duplicate).length
  const errorCount = errors.length

  const willImportCount = rows.filter(
    (r) => !r.duplicate && (!unknownFunds.includes(r.fundName) || approvedFunds.has(r.fundName)),
  ).length

  const skippedByFund = rows.filter(
    (r) => !r.duplicate && unknownFunds.includes(r.fundName) && !approvedFunds.has(r.fundName),
  ).length

  const statCards = [
    { label: 'Válidas', value: validCount, dotColor: 'var(--pos)' },
    { label: 'Duplicadas', value: duplicateCount, dotColor: 'var(--warn)' },
    { label: 'Con errores', value: errorCount, dotColor: 'var(--neg)' },
  ]

  return (
    <div>
      {/* Stats */}
      <div className="stat-row-container" style={{ marginBottom: 16 }}>
        <div className="stat-row">
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              boxShadow: 'var(--shadow)',
              padding: '14px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: card.dotColor, flex: 'none' }} />
              {card.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
              {card.value}
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Table */}
      <div className="import-table-container" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div
          className="import-table-header"
          style={{
            padding: '11px 20px',
            borderBottom: '1px solid var(--border)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            color: 'var(--muted)',
          }}
        >
          <div>Fecha</div>
          <div>Descripción</div>
          <div style={{ textAlign: 'right' }}>Monto</div>
          <div>Fondo</div>
          <div>Estado</div>
        </div>
        {visibleRows.map((row) => {
          const badge = rowBadge(row, unknownFunds, approvedFunds)
          const opacity = rowOpacity(row, unknownFunds, approvedFunds)
          const amtColor = row.type === 'income' ? 'var(--pos)' : 'var(--neg)'
          const prefix = row.type === 'income' ? '+' : '-'
          return (
            <div
              key={`${row.sheet}-${row.cell}`}
              className="import-row"
              style={{
                padding: '11px 20px',
                borderBottom: '1px solid var(--border)',
                background: row.duplicate ? 'var(--warn-bg)' : 'transparent',
                opacity,
              }}
            >
              <div className="import-row-date" style={{ color: 'var(--muted)' }}>
                {row.occurredOn}
              </div>
              <div className="import-row-desc" style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.description ?? '—'}
              </div>
              <div className="import-row-amount" style={{ color: amtColor }}>
                {prefix}{formatMoney(row.amount, 'CLP')}
              </div>
              <div className="import-row-fund" style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.fundName}
              </div>
              <div className="import-row-status">
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: 20,
                    background: badge.bg,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
            Página {page + 1} de {totalPages} · {rows.length} filas
          </span>
          <Pagination page={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
        </div>
      )}

      {/* Unknown funds section */}
      {unknownFunds.length > 0 && (
        <UnknownFundsSection
          unknownFunds={unknownFunds}
          approvedFunds={approvedFunds}
          onToggle={onToggleFund}
        />
      )}

      {/* Warning banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 9,
          padding: '12px 14px',
          background: 'var(--warn-bg)',
          borderRadius: 10,
          marginTop: 16,
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 1 }}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.55 }}>
          Se importarán <strong>{willImportCount} transacciones</strong>. {duplicateCount} duplicadas se omiten.
          {skippedByFund > 0 && ` ${skippedByFund} filas se omitirán por fondos no aprobados.`}
          {errorCount > 0 && ` ${errorCount} filas no pudieron parsearse y se excluyen.`}
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: 'var(--neg)', marginTop: 12, fontWeight: 500, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <Button variant="secondary" onClick={onBack} disabled={isPending}>
          ← Volver
        </Button>
        <Button onClick={onConfirm} disabled={isPending || willImportCount === 0}>
          {isPending ? 'Importando…' : `Confirmar e importar ${willImportCount}`}
        </Button>
      </div>
    </div>
  )
}
