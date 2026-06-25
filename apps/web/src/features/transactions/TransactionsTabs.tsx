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
  return (
    <div style={{ display: 'inline-flex', padding: 3, background: 'var(--card-2)', border: '1px solid var(--border)', borderRadius: 10, gap: 3 }}>
      {TABS.map((tab) => {
        const active = tab.value === value
        return (
          <div
            key={tab.value}
            onClick={() => onChange(tab.value)}
            style={{
              padding: '6px 13px',
              borderRadius: 7,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all .15s',
              background: active ? 'var(--card)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--muted)',
              boxShadow: active ? 'var(--shadow)' : 'none',
              fontWeight: active ? 600 : 500,
            }}
          >
            {tab.label}
          </div>
        )
      })}
    </div>
  )
}
