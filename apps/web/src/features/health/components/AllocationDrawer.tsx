import { useEffect, useReducer } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { formatMoney } from '../../../lib/money'
import { useCreateAllocation } from '../hooks'
import { buildInitialState, computeProposed, drawerReducer, getFrameworkFunds } from '../allocationDrawer.utils'
import type { CurrentAllocation, HealthProfile } from '../types'
import type { Fund } from '../../funds/types'
import { AllocationIncomeStep } from './AllocationIncomeStep'
import { AllocationDistributionStep } from './AllocationDistributionStep'

interface Props {
  open: boolean
  onClose: () => void
  profile: HealthProfile
  funds: Fund[]
  currentAllocation: CurrentAllocation
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

  async function handleConfirm() {
    const distributions = activeFunds.map((f) => ({
      fundId: f.id,
      amount: amounts[f.id] ?? '0',
    }))
    await createMutation.mutateAsync({ totalAmount: rawIncome, distributions })
    onClose()
  }

  const total = BigInt(rawIncome || '0')
  const monthName = new Date().toLocaleString('es', { month: 'long', year: 'numeric' })

  if (!open) return null

  return (
    <Modal
      title={step === 'income' ? 'Ingreso del mes' : `Distribuir ${monthName}`}
      onClose={onClose}
      position="right"
      width={460}
    >
      {step === 'distribution' && total > 0n && (
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: -12, marginBottom: 16 }}>
          Total: {formatMoney(String(total), 'CLP')}
        </div>
      )}

      {step === 'income' && (
        <AllocationIncomeStep
          rawIncome={rawIncome}
          onChangeIncome={(value) => dispatch({ type: 'SET_INCOME', rawIncome: value })}
          onConfirm={handleIncomeConfirm}
        />
      )}

      {step === 'distribution' && (
        <AllocationDistributionStep
          activeFunds={activeFunds}
          amounts={amounts}
          total={total}
          onAmountChange={(fundId, value) => dispatch({ type: 'CHANGE_AMOUNT', fundId, value })}
          onConfirm={handleConfirm}
          isPending={createMutation.isPending}
        />
      )}
    </Modal>
  )
}
