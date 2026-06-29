// apps/web/src/features/transfers/TransfersPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DateInput } from '../../components/ui/DateInput'
import { useFundsAll } from '../funds'
import { FundPicker } from './components/FundPicker'
import { useCreateTransfer, useTransfers } from './hooks'
import type { Transfer } from './types'

const fmt = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDateLabel(iso: string): string {
  const [, m, d] = iso.split('-')
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]}`
}

export function TransfersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      // The transfer form is always visible by default (step === 'form').
      // Just remove the param so reloading doesn't re-trigger anything.
      setSearchParams(  
        prev => { const n = new URLSearchParams(prev); n.delete('action'); return n },
        { replace: true },
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: allFunds = [] } = useFundsAll()
  const funds = allFunds.filter((f) => !f.archivedAt)
  const { data: recentData } = useTransfers({ limit: 10 })
  const { mutate: doTransfer, isPending } = useCreateTransfer()

  const [fromFundId, setFromFundId] = useState<string | null>(null)
  const [toFundId, setToFundId] = useState<string | null>(null)
  const [rawAmount, setRawAmount] = useState('')        // digits only, e.g. "300000"
  const [occurredOn, setOccurredOn] = useState(todayISO)
  const [note, setNote] = useState('')
  const [amountError, setAmountError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [lastTransfer, setLastTransfer] = useState<Transfer | null>(null)
  // Captured at submit time so the success state shows correct values
  // even after useFundsAll() refetches with updated server balances.
  const [successFromBalance, setSuccessFromBalance] = useState(0)
  const [successToBalance, setSuccessToBalance] = useState(0)

  const fromFund = funds.find((f) => f.id === fromFundId) ?? null
  const toFund = funds.find((f) => f.id === toFundId) ?? null
  const parsedAmount = parseInt(rawAmount || '0', 10)
  const fromBalance = fromFund ? Number(fromFund.balance) : 0
  const toBalance = toFund ? Number(toFund.balance) : 0

  const fromProjected = parsedAmount > 0 && fromFund ? fromBalance - parsedAmount : null
  const toProjected = parsedAmount > 0 && toFund ? toBalance + parsedAmount : null

  const quickAmounts = fromFund
    ? [
        { label: '25%', value: Math.floor(fromBalance / 4) },
        { label: '50%', value: Math.floor(fromBalance / 2) },
        { label: '75%', value: Math.floor(fromBalance * 3 / 4) },
        { label: 'Todo', value: fromBalance },
      ]
    : []

  const totalNetWorth = funds.reduce((sum, f) => sum + Number(f.balance), 0)
  const canSubmit = !!fromFundId && !!toFundId && parsedAmount > 0 && parsedAmount <= fromBalance && !isPending

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    setRawAmount(digits)
    setAmountError(null)
  }

  function setQuick(value: number) {
    setRawAmount(String(value))
    setAmountError(null)
  }

  function handleSubmit() {
    if (!fromFundId || !toFundId) return
    if (parsedAmount <= 0) {
      setAmountError('El monto debe ser mayor a cero')
      return
    }
    if (parsedAmount > fromBalance) {
      setAmountError('El monto supera el saldo disponible')
      return
    }
    doTransfer(
      { fromFundId, toFundId, amount: String(parsedAmount), occurredOn, note: note || undefined },
      {
        onSuccess: (transfer) => {
          setSuccessFromBalance(fromBalance - parsedAmount)
          setSuccessToBalance(toBalance + parsedAmount)
          setLastTransfer(transfer)
          setStep('success')
        },
        onError: () => {
          setAmountError('No se pudo realizar la transferencia. Intenta de nuevo.')
        },
      },
    )
  }

  function reset() {
    setFromFundId(null)
    setToFundId(null)
    setRawAmount('')
    setOccurredOn(todayISO())
    setNote('')
    setAmountError(null)
    setLastTransfer(null)
    setStep('form')
  }

  const fundMap = Object.fromEntries(allFunds.map((f) => [f.id, f.name]))
  const recentTransfers = recentData?.data ?? []

  // ─── Empty state ─────────────────────────────────────────────────────────────
  if (funds.length < 2) {
    return (
      <div style={{ maxWidth: 660, margin: '0 auto' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 40, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.01em' }}>Necesitas al menos dos fondos</div>
          <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 8, maxWidth: 340, margin: '8px auto 0', lineHeight: 1.55 }}>
            Las transferencias mueven saldo entre fondos. Crea al menos dos fondos para empezar.
          </div>
          <button
            onClick={() => navigate('/fondos')}
            style={{ marginTop: 22, height: 42, padding: '0 22px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)' }}
          >
            Ir a Fondos
          </button>
        </div>
      </div>
    )
  }

  // ─── Success state ───────────────────────────────────────────────────────────
  if (step === 'success' && lastTransfer && toFund && fromFund) {
    return (
      <div style={{ maxWidth: 660, margin: '0 auto' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 24 }}>
          <div style={{ textAlign: 'center', padding: '14px 6px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--pos-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--pos)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em' }}>Transferencia realizada</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 6 }}>
              Moviste dinero entre tus fondos. El movimiento ya aparece en tu historial.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '22px auto 0', maxWidth: 420 }}>
              <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 12, padding: 14, background: 'var(--card-2)', textAlign: 'left' }}>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}>Desde</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{fromFund.name}</div>
                <div style={{ fontSize: 13, color: 'var(--neg)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{fmt.format(successFromBalance)}</div>
              </div>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
              <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 12, padding: 14, background: 'var(--card-2)', textAlign: 'left' }}>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}>Hacia</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{toFund.name}</div>
                <div style={{ fontSize: 13, color: 'var(--pos)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{fmt.format(successToBalance)}</div>
              </div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums', marginTop: 20 }}>
              {fmt.format(parsedAmount)}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
              {formatDateLabel(lastTransfer.occurredOn)}{lastTransfer.note ? ` · ${lastTransfer.note}` : ''}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
              <button
                onClick={reset}
                style={{ flex: 1, height: 46, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
              >
                Hacer otra
              </button>
              <button
                onClick={() => navigate('/fondos/' + toFund.id)}
                style={{ flex: 1.4, height: 46, border: 'none', borderRadius: 10, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)' }}
              >
                Ver {toFund.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Form state ──────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 660, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em' }}>Mover dinero entre fondos</div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 4 }}>
          Una transferencia reasigna saldo. Tu patrimonio neto no cambia.
        </div>
      </div>

      {/* Form card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 24, marginTop: 22 }}>

        {/* From / To pickers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', alignItems: 'center', gap: 8 }}>
          <FundPicker
            label="Desde"
            direction="from"
            funds={funds}
            selectedId={fromFundId}
            onChange={setFromFundId}
            exclude={toFundId}
            projectedBalance={fromProjected}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </div>
          <FundPicker
            label="Hacia"
            direction="to"
            funds={funds}
            selectedId={toFundId}
            onChange={setToFundId}
            exclude={fromFundId}
            projectedBalance={toProjected}
            disabled={!fromFundId}
          />
        </div>

        {/* Amount */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Monto a transferir</div>
          <div style={{ display: 'flex', alignItems: 'center', height: 60, border: `1px solid ${amountError ? 'var(--neg)' : 'var(--border-strong)'}`, borderRadius: 12, background: 'var(--field)', padding: '0 18px' }}>
            <span style={{ fontSize: 28, fontWeight: 500, color: 'var(--muted)' }}>$</span>
            <input
              type="text"
              inputMode="numeric"
              value={rawAmount ? parseInt(rawAmount, 10).toLocaleString('es-CL') : ''}
              onChange={handleAmountChange}
              placeholder="0"
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 28, fontWeight: 600, color: 'var(--text)', marginLeft: 8, fontVariantNumeric: 'tabular-nums' }}
            />
          </div>
          {amountError && (
            <div style={{ fontSize: 12, color: 'var(--neg)', marginTop: 5 }}>{amountError}</div>
          )}

          {/* Quick-pick chips */}
          {quickAmounts.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {quickAmounts.map(({ label, value }) => {
                const isActive = value === parsedAmount && parsedAmount > 0
                return (
                  <span
                    key={label}
                    onClick={() => setQuick(value)}
                    style={{
                      fontSize: 12,
                      padding: '5px 11px',
                      borderRadius: 8,
                      background: isActive ? 'var(--info-bg)' : 'var(--card-2)',
                      border: '1px solid var(--border)',
                      color: isActive ? 'var(--info)' : 'var(--muted)',
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {label === 'Todo' ? 'Todo' : `${fmt.format(value)}`}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Date + Note */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
          <DateInput
            label="Fecha"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
          />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Nota (opcional)</div>
            <div style={{ display: 'flex', alignItems: 'center', height: 44, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--field)', padding: '0 14px' }}>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: refuerzo colchón"
                style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)' }}
              />
            </div>
          </div>
        </div>

        {/* Net worth banner */}
        {fromFundId && toFundId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', background: 'var(--pos-bg)', borderRadius: 10, marginTop: 18 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--pos)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <div style={{ fontSize: 12.5, color: 'var(--text)' }}>
              Patrimonio total intacto: <b>{fmt.format(totalNetWorth)}</b>. Solo cambia cómo está repartido.
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={reset}
            style={{ flex: 1, height: 46, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ flex: 1.6, height: 46, border: 'none', borderRadius: 10, background: canSubmit ? 'var(--grad)' : 'var(--border)', color: canSubmit ? '#fff' : 'var(--muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'not-allowed', boxShadow: canSubmit ? 'var(--shadow)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .15s' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            {isPending ? 'Transfiriendo…' : parsedAmount > 0 ? `Transferir ${fmt.format(parsedAmount)}` : 'Transferir'}
          </button>
        </div>
      </div>

      {/* Recent transfers */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>Transferencias recientes</div>
        {recentTransfers.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
            Todavía no hay transferencias registradas.
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            {recentTransfers.map((t, i) => (
              <div
                key={t.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < recentTransfers.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <span style={{ fontSize: 12, color: 'var(--muted)', width: 56, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {formatDateLabel(t.occurredOn)}
                </span>
                <span style={{ fontSize: 13.5, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fundMap[t.fromFundId] ?? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Fondo eliminado</span>}{' '}
                  <span style={{ color: 'var(--muted)' }}>→</span>{' '}
                  {fundMap[t.toFundId] ?? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Fondo eliminado</span>}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--info)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {t.amountFormatted}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
