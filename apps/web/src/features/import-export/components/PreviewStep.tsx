import { formatMoney } from '../../../lib/money'
import type { ImportPreviewResponseDto, ImportRowDto } from '../types'
import { UnknownFundsSection } from './UnknownFundsSection'

interface Props {
  previewData: ImportPreviewResponseDto
  approvedFunds: Set<string>
  onToggleFund: (name: string) => void
  onBack: () => void
  onConfirm: () => void
  isPending: boolean
}

function rowBadge(
  row: ImportRowDto,
  unknownFunds: string[],
  approvedFunds: Set<string>,
): { label: string; bg: string; color: string } {
  if (row.duplicate) return { label: 'Duplicada', bg: 'var(--warn-bg)', color: 'var(--warn)' }
  if (unknownFunds.includes(row.fundName) && !approvedFunds.has(row.fundName)) {
    return { label: 'Se omitirá', bg: 'var(--card-2)', color: 'var(--muted)' }
  }
  return { label: 'Válida', bg: 'var(--pos-bg)', color: 'var(--pos)' }
}

function rowOpacity(row: ImportRowDto, unknownFunds: string[], approvedFunds: Set<string>): number {
  if (row.duplicate) return 0.6
  if (unknownFunds.includes(row.fundName) && !approvedFunds.has(row.fundName)) return 0.5
  return 1
}

export function PreviewStep({ previewData, approvedFunds, onToggleFund, onBack, onConfirm, isPending }: Props) {
  const { rows, unknownFunds, errors } = previewData

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
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

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr 140px 150px 110px',
            gap: 12,
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
        {rows.map((row) => {
          const badge = rowBadge(row, unknownFunds, approvedFunds)
          const opacity = rowOpacity(row, unknownFunds, approvedFunds)
          const amtColor = row.type === 'income' ? 'var(--pos)' : 'var(--neg)'
          const prefix = row.type === 'income' ? '+' : '-'
          return (
            <div
              key={row.dedupeHash}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr 140px 150px 110px',
                gap: 12,
                alignItems: 'center',
                padding: '11px 20px',
                borderBottom: '1px solid var(--border)',
                background: row.duplicate ? 'var(--warn-bg)' : 'transparent',
                opacity,
              }}
            >
              <div style={{ fontSize: 12.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                {row.occurredOn}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.description ?? '—'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: amtColor }}>
                {prefix}{formatMoney(row.amount, 'CLP')}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.fundName}
              </div>
              <div>
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

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button
          onClick={onBack}
          disabled={isPending}
          style={{
            height: 44,
            padding: '0 18px',
            border: '1px solid var(--border)',
            borderRadius: 10,
            background: 'var(--card)',
            color: 'var(--text)',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 500,
            cursor: isPending ? 'default' : 'pointer',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          ← Volver
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending || willImportCount === 0}
          style={{
            height: 44,
            padding: '0 22px',
            border: 'none',
            borderRadius: 10,
            background: isPending || willImportCount === 0 ? 'var(--card-2)' : 'var(--grad)',
            color: isPending || willImportCount === 0 ? 'var(--muted)' : '#fff',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 600,
            cursor: isPending || willImportCount === 0 ? 'default' : 'pointer',
            boxShadow: isPending || willImportCount === 0 ? 'none' : 'var(--shadow)',
          }}
        >
          {isPending ? 'Importando…' : `Confirmar e importar ${willImportCount}`}
        </button>
      </div>
    </div>
  )
}
