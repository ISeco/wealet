// apps/web/src/features/transfers/TransfersPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { DateInput } from '../../components/ui/DateInput'
import { ArrowRightIcon, CheckIcon } from '../../components/ui/icons'
import { formatMoney, formatThousands } from '../../lib/money'
import { useFundsAll } from '../funds'
import { FundPicker } from './components/FundPicker'
import { useCreateTransfer, useTransfers } from './hooks'
import type { Transfer } from './types'
import { computeQuickAmounts, formatDateLabel, validateTransferAmount } from './utils'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
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
  const [successFromBalance, setSuccessFromBalance] = useState(0n)
  const [successToBalance, setSuccessToBalance] = useState(0n)

  const fromFund = funds.find((f) => f.id === fromFundId) ?? null
  const toFund = funds.find((f) => f.id === toFundId) ?? null
  const parsedAmount = BigInt(rawAmount || '0')
  const fromBalance = fromFund ? BigInt(fromFund.balance) : 0n
  const toBalance = toFund ? BigInt(toFund.balance) : 0n

  // Number() here is acceptable — projected values are display-only in FundPicker
  const fromProjected = parsedAmount > 0n && fromFund ? Number(fromBalance - parsedAmount) : null
  const toProjected = parsedAmount > 0n && toFund ? Number(toBalance + parsedAmount) : null

  const quickAmounts = fromFund ? computeQuickAmounts(fromBalance) : []

  const totalNetWorth = funds.reduce((sum, f) => sum + BigInt(f.balance), 0n)
  const canSubmit = !!fromFundId && !!toFundId && parsedAmount > 0n && parsedAmount <= fromBalance && !isPending

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    setRawAmount(digits)
    setAmountError(null)
  }

  function setQuick(value: bigint) {
    setRawAmount(value.toString())
    setAmountError(null)
  }

  function handleSubmit() {
    if (!fromFundId || !toFundId) return
    const error = validateTransferAmount(parsedAmount, fromBalance)
    if (error) {
      setAmountError(error)
      return
    }
    doTransfer(
      { fromFundId, toFundId, amount: parsedAmount.toString(), occurredOn, note: note || undefined },
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
            <ArrowRightIcon color="var(--muted)" size={26} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.01em' }}>Necesitas al menos dos fondos</div>
          <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 8, maxWidth: 340, margin: '8px auto 0', lineHeight: 1.55 }}>
            Las transferencias mueven saldo entre fondos. Crea al menos dos fondos para empezar.
          </div>
          <Button onClick={() => navigate('/fondos')} style={{ marginTop: 22, height: 42, padding: '0 22px' }}>
            Ir a Fondos
          </Button>
        </div>
      </div>
    )
  }

  // ─── Success state ───────────────────────────────────────────────────────────
  if (step === 'success' && lastTransfer && toFund && fromFund) {
    return (
      <div className="transfer-page" style={{ maxWidth: 660, margin: '0 auto' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 24 }}>
          <div style={{ textAlign: 'center', padding: '14px 6px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--pos-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <CheckIcon color="var(--pos)" size={32} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em' }}>Transferencia realizada</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 6 }}>
              Moviste dinero entre tus fondos. El movimiento ya aparece en tu historial.
            </div>

            <div className="transfer-fund-row" style={{ margin: '22px auto 0', maxWidth: 420 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 14, background: 'var(--card-2)', textAlign: 'left' }}>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}>Desde</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{fromFund.name}</div>
                <div style={{ fontSize: 13, color: 'var(--neg)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{formatMoney(successFromBalance.toString(), 'CLP')}</div>
              </div>
              <span className="transfer-fund-arrow" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowRightIcon color="#fff" size={17} />
              </span>
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 14, background: 'var(--card-2)', textAlign: 'left' }}>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}>Hacia</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{toFund.name}</div>
                <div style={{ fontSize: 13, color: 'var(--pos)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{formatMoney(successToBalance.toString(), 'CLP')}</div>
              </div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums', marginTop: 20 }}>
              {formatMoney(parsedAmount.toString(), 'CLP')}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
              {formatDateLabel(lastTransfer.occurredOn)}{lastTransfer.note ? ` · ${lastTransfer.note}` : ''}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
              <Button variant="secondary" onClick={reset} style={{ flex: 1, borderRadius: 10 }}>
                Hacer otra
              </Button>
              <Button onClick={() => navigate('/fondos/' + toFund.id)} style={{ flex: 1.4, borderRadius: 10 }}>
                Ver {toFund.name}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Form state ──────────────────────────────────────────────────────────────
  return (
    <div className="transfer-page" style={{ maxWidth: 660, margin: '0 auto' }}>
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
        <div className="transfer-fund-row">
          <FundPicker
            label="Desde"
            direction="from"
            funds={funds}
            selectedId={fromFundId}
            onChange={setFromFundId}
            exclude={toFundId}
            projectedBalance={fromProjected}
          />
          <div className="transfer-fund-arrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
              <ArrowRightIcon color="#fff" size={20} />
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
              value={formatThousands(rawAmount)}
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
                const isActive = value === parsedAmount && parsedAmount > 0n
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
                    {label === 'Todo' ? 'Todo' : formatMoney(value.toString(), 'CLP')}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Date + Note */}
        <div className="transfer-date-note-row" style={{ marginTop: 18 }}>
          <DateInput
            label="Fecha"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            maxDate={todayISO()}
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
            <CheckIcon color="var(--pos)" size={17} />
            <div style={{ fontSize: 12.5, color: 'var(--text)' }}>
              Patrimonio total intacto: <b>{formatMoney(totalNetWorth.toString(), 'CLP')}</b>. Solo cambia cómo está repartido.
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button variant="secondary" onClick={reset} style={{ flex: 1, borderRadius: 10 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ flex: 1.6, borderRadius: 10 }}
          >
            <ArrowRightIcon size={16} />
            {isPending ? 'Transfiriendo…' : parsedAmount > 0n ? `Transferir ${formatMoney(parsedAmount.toString(), 'CLP')}` : 'Transferir'}
          </Button>
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
                className="transfer-recent-row"
                style={{ padding: '13px 18px', borderBottom: i < recentTransfers.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="transfer-recent-top">
                  <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {formatDateLabel(t.occurredOn)}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--info)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                    {t.amountFormatted}
                  </span>
                </div>
                <span className="transfer-recent-flow" style={{ fontSize: 13.5 }}>
                  {fundMap[t.fromFundId] ?? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Fondo eliminado</span>}{' '}
                  <span style={{ color: 'var(--muted)' }}>→</span>{' '}
                  {fundMap[t.toFundId] ?? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Fondo eliminado</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
