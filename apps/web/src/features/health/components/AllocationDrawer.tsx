import { useEffect, useReducer } from 'react'
import { formatThousands } from '../../../lib/money'
import { useCreateAllocation } from '../hooks'
import type { CurrentAllocation, HealthProfile } from '../types'
import type { Fund } from '../../funds/types'

interface Props {
  open: boolean
  onClose: () => void
  profile: HealthProfile
  funds: Fund[]
  currentAllocation: CurrentAllocation
}

function getSlotPrefix(framework: string): string | null {
  if (framework === 'fondos') return null
  if (framework === '50_30_20') return '50_30_20_'
  if (framework === 'jars_eker') return 'jars_'
  return 'profit_first:'
}

function getFrameworkFunds(funds: Fund[], framework: string): Fund[] {
  const prefix = getSlotPrefix(framework)
  if (prefix === null) {
    return funds.filter((f) => f.frameworkSlot === null && !f.archivedAt)
  }
  return funds.filter((f) => f.frameworkSlot?.startsWith(prefix) && !f.archivedAt)
}

function computeProposed(activeFunds: Fund[], totalAmount: bigint): Record<string, string> {
  if (activeFunds.length === 0) return {}
  const hasPct = activeFunds.some((f) => (f.targetPercentage ?? 0) > 0)
  if (!hasPct) {
    const base = totalAmount / BigInt(activeFunds.length)
    const rem = totalAmount % BigInt(activeFunds.length)
    return Object.fromEntries(
      activeFunds.map((f, i) => [f.id, String(i === 0 ? base + rem : base)]),
    )
  }
  const result: Record<string, string> = {}
  let allocated = 0n
  activeFunds.forEach((f) => {
    const pct = f.targetPercentage ?? 0
    const amt = pct > 0 ? (totalAmount * BigInt(pct)) / 100n : 0n
    result[f.id] = String(amt)
    allocated += amt
  })
  const remainder = totalAmount - allocated
  if (remainder !== 0n) {
    const first = activeFunds.find((f) => (f.targetPercentage ?? 0) > 0)
    if (first) result[first.id] = String(BigInt(result[first.id]) + remainder)
  }
  return result
}

function formatCLP(value: string): string {
  if (!value) return ''
  return '$' + formatThousands(value)
}

type DrawerStep = 'income' | 'distribution'

interface DrawerState {
  step: DrawerStep
  rawIncome: string
  amounts: Record<string, string>
}

type DrawerAction =
  | { type: 'RESET'; payload: DrawerState }
  | { type: 'SET_INCOME'; rawIncome: string }
  | { type: 'SET_AMOUNTS'; amounts: Record<string, string> }
  | { type: 'ADVANCE_TO_DISTRIBUTION'; amounts: Record<string, string>; rawIncome: string }
  | { type: 'CHANGE_AMOUNT'; fundId: string; value: string }

function drawerReducer(state: DrawerState, action: DrawerAction): DrawerState {
  switch (action.type) {
    case 'RESET':
      return action.payload
    case 'SET_INCOME':
      return { ...state, rawIncome: action.rawIncome }
    case 'SET_AMOUNTS':
      return { ...state, amounts: action.amounts }
    case 'ADVANCE_TO_DISTRIBUTION':
      return { ...state, step: 'distribution', amounts: action.amounts, rawIncome: action.rawIncome }
    case 'CHANGE_AMOUNT':
      return { ...state, amounts: { ...state.amounts, [action.fundId]: action.value.replace(/\D/g, '') } }
  }
}

function buildInitialState(
  profile: HealthProfile,
  currentAllocation: CurrentAllocation,
  activeFunds: Fund[],
): DrawerState {
  const hasIncome = !!(currentAllocation?.totalAmount ?? profile.monthlyIncome)
  const step: DrawerStep = hasIncome ? 'distribution' : 'income'
  const rawIncome = currentAllocation?.totalAmount ?? profile.monthlyIncome ?? ''

  let amounts: Record<string, string> = {}
  if (currentAllocation) {
    currentAllocation.distributions.forEach((d) => { amounts[d.fundId] = d.amount })
  } else if (profile.monthlyIncome && activeFunds.length > 0) {
    amounts = computeProposed(activeFunds, BigInt(profile.monthlyIncome))
  }

  return { step, rawIncome, amounts }
}

export function AllocationDrawer({ open, onClose, profile, funds, currentAllocation }: Props) {
  const activeFunds = getFrameworkFunds(funds, profile.framework)

  const [state, dispatch] = useReducer(
    drawerReducer,
    undefined,
    () => buildInitialState(profile, currentAllocation, activeFunds),
  )
  const { step, rawIncome, amounts } = state

  const createMutation = useCreateAllocation()

  useEffect(() => {
    if (!open) return
    dispatch({
      type: 'RESET',
      payload: buildInitialState(profile, currentAllocation, activeFunds),
    })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleIncomeConfirm() {
    const total = BigInt(rawIncome || '0')
    if (total <= 0n) return
    dispatch({
      type: 'ADVANCE_TO_DISTRIBUTION',
      amounts: computeProposed(activeFunds, total),
      rawIncome,
    })
  }

  function handleAmountChange(fundId: string, value: string) {
    dispatch({ type: 'CHANGE_AMOUNT', fundId, value })
  }

  async function handleConfirm() {
    const distributions = activeFunds.map((f) => ({
      fundId: f.id,
      amount: amounts[f.id] ?? '0',
    }))
    await createMutation.mutateAsync({ totalAmount: rawIncome, distributions })
    onClose()
  }

  const total = BigInt(rawIncome || '0')
  const sumAmounts = activeFunds.reduce(
    (acc, f) => acc + BigInt(amounts[f.id] || '0'),
    0n,
  )
  const isValid = activeFunds.length > 0 && sumAmounts === total && total > 0n

  const monthName = new Date().toLocaleString('es', { month: 'long', year: 'numeric' })

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 200,
        }}
      />
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 460,
          background: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          padding: 28,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
              {step === 'income' ? 'Ingreso del mes' : `Distribuir ${monthName}`}
            </div>
            {step === 'distribution' && total > 0n && (
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Total: {formatCLP(String(total))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: 20,
              color: 'var(--muted)', cursor: 'pointer', padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {step === 'income' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>
              ¿Cuánto recibiste este mes? Ingresa el monto total de tu ingreso en CLP.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', background: 'var(--card-2)' }}>
              <span style={{ color: 'var(--muted)', fontWeight: 600 }}>$</span>
              <input
                type="text"
                inputMode="numeric"
                value={formatThousands(rawIncome)}
                onChange={(e) => dispatch({ type: 'SET_INCOME', rawIncome: e.target.value.replace(/\D/g, '') })}
                placeholder="1.000.000"
                style={{
                  flex: 1, border: 'none', background: 'none',
                  fontSize: 15, fontWeight: 600, color: 'var(--text)',
                  outline: 'none', fontFamily: 'inherit',
                }}
                autoFocus
              />
            </div>
            <button
              onClick={handleIncomeConfirm}
              disabled={!rawIncome || BigInt(rawIncome || '0') <= 0n}
              style={{
                padding: '11px 0', borderRadius: 8, border: 'none',
                background: 'var(--grad)', color: '#fff', fontWeight: 600,
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                opacity: (!rawIncome || BigInt(rawIncome || '0') <= 0n) ? 0.5 : 1,
              }}
            >
              Continuar →
            </button>
          </div>
        )}

        {step === 'distribution' && (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeFunds.length === 0 && (
                <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
                  No hay fondos activos para este framework.
                </p>
              )}
              {activeFunds.map((fund) => (
                <div
                  key={fund.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    background: 'var(--card-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>
                      {fund.name}
                    </div>
                    {fund.targetPercentage != null && fund.targetPercentage > 0 && (
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                        Meta {fund.targetPercentage}%
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', borderRadius: 7, padding: '6px 10px', background: 'var(--card)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatThousands(amounts[fund.id] ?? '0')}
                      onChange={(e) => handleAmountChange(fund.id, e.target.value)}
                      style={{
                        width: 110, border: 'none', background: 'none',
                        fontSize: 13.5, fontWeight: 600, color: 'var(--text)',
                        outline: 'none', fontFamily: 'inherit', textAlign: 'right',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 13, fontWeight: 600,
                }}
              >
                <span style={{ color: 'var(--muted)' }}>Total asignado</span>
                <span style={{ color: isValid ? '#16A89A' : '#DC2626' }}>
                  {formatCLP(String(sumAmounts))} / {formatCLP(String(total))}
                </span>
              </div>
              <button
                onClick={handleConfirm}
                disabled={!isValid || createMutation.isPending}
                style={{
                  padding: '12px 0', borderRadius: 8, border: 'none',
                  background: 'var(--grad)', color: '#fff', fontWeight: 600,
                  fontSize: 14, cursor: isValid ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  opacity: (!isValid || createMutation.isPending) ? 0.5 : 1,
                }}
              >
                {createMutation.isPending ? 'Confirmando…' : 'Confirmar distribución'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
