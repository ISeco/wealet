import { frameworkSlotPrefix } from './utils'
import type { CurrentAllocation, HealthProfile } from './types'
import type { Fund } from '../funds/types'

export function getFrameworkFunds(funds: Fund[], framework: HealthProfile['framework']): Fund[] {
  const prefix = frameworkSlotPrefix(framework)
  if (prefix === null) {
    return funds.filter((f) => f.frameworkSlot === null && !f.archivedAt)
  }
  return funds.filter((f) => f.frameworkSlot?.startsWith(prefix) && !f.archivedAt)
}

export function computeProposed(activeFunds: Fund[], totalAmount: bigint): Record<string, string> {
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

export type DrawerStep = 'income' | 'distribution'

export interface DrawerState {
  step: DrawerStep
  rawIncome: string
  amounts: Record<string, string>
}

export type DrawerAction =
  | { type: 'RESET'; payload: DrawerState }
  | { type: 'SET_INCOME'; rawIncome: string }
  | { type: 'ADVANCE_TO_DISTRIBUTION'; amounts: Record<string, string>; rawIncome: string }
  | { type: 'CHANGE_AMOUNT'; fundId: string; value: string }

export function drawerReducer(state: DrawerState, action: DrawerAction): DrawerState {
  switch (action.type) {
    case 'RESET':
      return action.payload
    case 'SET_INCOME':
      return { ...state, rawIncome: action.rawIncome }
    case 'ADVANCE_TO_DISTRIBUTION':
      return { ...state, step: 'distribution', amounts: action.amounts, rawIncome: action.rawIncome }
    case 'CHANGE_AMOUNT':
      return { ...state, amounts: { ...state.amounts, [action.fundId]: action.value.replace(/\D/g, '') } }
  }
}

export function buildInitialState(
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
