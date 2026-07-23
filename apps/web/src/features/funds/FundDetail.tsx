import { useMemo, useState } from 'react'
import { formatMonthLabel, monthDateRange } from '../dashboard/utils'
import { MonthSelector } from '../dashboard/components/MonthSelector'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Pagination } from '../../components/ui/Pagination'
import { TrashIcon } from '../../components/ui/icons'
import { useCategories } from '../categories'
import { useTransactions } from '../transactions/hooks'
import { TransactionFormModal } from '../transactions/TransactionFormModal'
import type { Transaction } from '../transactions'
import { useDeleteFund, useFundHistory, useFundMonths, useFunds } from './hooks'
import { FundFormDrawer } from './components/FundFormDrawer'
import { FundHeaderCard } from './components/FundHeaderCard'
import { FundStatsColumn } from './components/FundStatsColumn'
import { FundTransactionsList } from './components/FundTransactionsList'

const RECENT_TX_LIMIT = 10

interface FundDetailProps {
  fundId: string
  onBack: () => void
}

export function FundDetail({ fundId, onBack }: FundDetailProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [recentTxPage, setRecentTxPage] = useState(1)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [prevFundId, setPrevFundId] = useState(fundId)
  const { data: funds = [] } = useFunds()
  const { data: history = [] } = useFundHistory(fundId)
  const { data: months = [] } = useFundMonths(fundId)
  const { data: categories = [] } = useCategories()
  const deleteMutation = useDeleteFund()

  const fund = funds.find((f) => f.id === fundId)

  if (fundId !== prevFundId) {
    setPrevFundId(fundId)
    setRecentTxPage(1)
    setSelectedMonth(null)
  }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const activeMonth = selectedMonth ?? months[0] ?? currentMonth
  const { from: monthStart, to: monthEnd } = monthDateRange(activeMonth)

  const { data: monthTxData } = useTransactions({ fundId, from: monthStart, to: monthEnd, limit: 500 })
  const { data: recentTxData } = useTransactions({ fundId, from: monthStart, to: monthEnd, page: recentTxPage, limit: RECENT_TX_LIMIT })

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

  const recentTxTotal = recentTxData?.total ?? 0
  const recentTxTotalPages = Math.max(1, Math.ceil(recentTxTotal / RECENT_TX_LIMIT))

  function handleMonthChange(month: string) {
    setSelectedMonth(month)
    setRecentTxPage(1)
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(fundId)
      onBack()
    } catch {
      setDeleteError(true)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <Button
          variant="secondary"
          muted
          onClick={onBack}
          style={{ height: 32, padding: '0 12px 0 8px', fontSize: 13 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Todos los fondos
        </Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Eliminar fondo"
            style={{ height: 32, padding: '0 12px 0 10px', fontSize: 13, color: 'var(--neg)' }}
          >
            <TrashIcon color="var(--neg)" size={14} />
            Eliminar
          </Button>
          <Button
            variant="secondary"
            muted
            onClick={() => setShowEdit(true)}
            style={{ height: 32, padding: '0 12px 0 10px', fontSize: 13 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
        <FundHeaderCard fund={fund} history={history} />
        <FundStatsColumn
          fund={fund}
          monthLabel={formatMonthLabel(activeMonth).toLowerCase()}
          monthIncome={monthIncome}
          monthExpense={monthExpense}
        />
      </div>

      <FundTransactionsList
        transactions={recentTxData?.data ?? []}
        categoryMap={categoryMap}
        monthLabel={formatMonthLabel(activeMonth).toLowerCase()}
        headerRight={<MonthSelector months={months} value={activeMonth} onChange={handleMonthChange} />}
        onTransactionClick={setSelectedTransaction}
      />

      {recentTxTotal > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 4px' }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            Mostrando <b style={{ color: 'var(--text)' }}>{recentTxData?.data.length ?? 0}</b> de {recentTxTotal} movimientos
          </div>
          <Pagination page={recentTxPage} totalPages={recentTxTotalPages} onPageChange={setRecentTxPage} />
        </div>
      )}

      {showEdit && (
        <FundFormDrawer
          fund={fund}
          onClose={() => setShowEdit(false)}
        />
      )}

      {selectedTransaction && (
        <TransactionFormModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {showConfirmDelete && (
        <ConfirmDialog
          title={`Eliminar «${fund.name}»`}
          description={
            <>
              El fondo se eliminará de tu lista. Si tiene movimientos registrados, se archivará en lugar de borrarse
              permanentemente.
              {deleteError && (
                <span style={{ display: 'block', color: 'var(--neg)', marginTop: 6 }}>
                  Error al eliminar. Intenta nuevamente.
                </span>
              )}
            </>
          }
          isPending={deleteMutation.isPending}
          onConfirm={handleDelete}
          onClose={() => { setShowConfirmDelete(false); setDeleteError(false) }}
        />
      )}
    </div>
  )
}
