import { useMemo, useState } from 'react'
import { useCategories } from '../categories'
import { useTransactions } from '../transactions/hooks'
import { TransactionFormModal } from '../transactions/TransactionFormModal'
import type { Transaction } from '../transactions'
import { useFundHistory, useFunds } from './hooks'
import { FundFormDrawer } from './components/FundFormDrawer'
import { FundHeaderCard } from './components/FundHeaderCard'
import { FundStatsColumn } from './components/FundStatsColumn'
import { FundTransactionsList } from './components/FundTransactionsList'

const MONTH_NAMES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

interface FundDetailProps {
  fundId: string
  onBack: () => void
}

export function FundDetail({ fundId, onBack }: FundDetailProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const { data: funds = [] } = useFunds()
  const { data: history = [] } = useFundHistory(fundId)
  const { data: categories = [] } = useCategories()

  const fund = funds.find((f) => f.id === fundId)

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  const monthName = MONTH_NAMES_ES[now.getMonth()]

  const { data: monthTxData } = useTransactions({ fundId, from: monthStart, to: monthEnd, limit: 500 })
  const { data: recentTxData } = useTransactions({ fundId, limit: 20 })

  const monthIncome = useMemo(
    () => (monthTxData?.data ?? []).filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
    [monthTxData],
  )

  const monthExpense = useMemo(
    () => (monthTxData?.data ?? []).filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    [monthTxData],
  )

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  )

  if (!fund) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 32, padding: '0 12px 0 8px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--muted)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Todos los fondos
        </button>
        <button
          onClick={() => setShowEdit(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 32, padding: '0 12px 0 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--muted)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Editar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <FundHeaderCard fund={fund} history={history} />
        <FundStatsColumn
          fund={fund}
          monthName={monthName}
          monthIncome={monthIncome}
          monthExpense={monthExpense}
        />
      </div>

      <FundTransactionsList
        transactions={recentTxData?.data ?? []}
        categoryMap={categoryMap}
        onTransactionClick={setSelectedTransaction}
      />

      {showEdit && (
        <FundFormDrawer
          fund={fund}
          onClose={() => setShowEdit(false)}
          onDelete={onBack}
        />
      )}

      {selectedTransaction && (
        <TransactionFormModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  )
}
