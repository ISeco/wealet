import { SegmentedTabs } from '../../components/ui/SegmentedTabs'

export type TabValue = 'all' | 'income' | 'expense' | 'transfers'

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'transfers', label: 'Transferencias' },
]

interface TransactionsTabsProps {
  value: TabValue
  onChange: (value: TabValue) => void
}

export function TransactionsTabs({ value, onChange }: TransactionsTabsProps) {
  return <SegmentedTabs options={TABS} value={value} onChange={onChange} />
}
