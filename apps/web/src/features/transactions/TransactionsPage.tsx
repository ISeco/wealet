import { useMemo, useState } from 'react'
import { useFunds } from '../funds'
import { useCategories } from '../categories'
import { Pagination } from '../../components/ui/Pagination'
import { useTransactions, useUpdateTransaction, useTransfers } from './hooks'
import { TransactionsToolbar } from './TransactionsToolbar'
import { TransactionsTabs, type TabValue } from './TransactionsTabs'
import { TransactionsTable, type TableRow } from './TransactionsTable'
import { TransactionFormModal } from './TransactionFormModal'
import type { Transaction, TransactionFilters } from './types'
import type { Transfer } from '../transfers/types'

const LIMIT = 20

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function formatChipDate(from?: string, to?: string): string | null {
  if (!from && !to) return null
  if (from && to) {
    const [fy, fm] = from.split('-')
    const [ty, tm] = to.split('-')
    if (fy === ty && fm === tm) return `${MONTH_NAMES[parseInt(fm) - 1]} ${fy}`
    return `${from} – ${to}`
  }
  return from ?? to ?? null
}

export function TransactionsPage() {
  const [tab, setTab] = useState<TabValue>('all')
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalTransaction, setModalTransaction] = useState<Transaction | 'new' | null>(null)

  const { data: funds = [] } = useFunds()
  const { data: categories = [] } = useCategories()
  const { mutate: updateTransaction } = useUpdateTransaction()

  const isTransfersTab = tab === 'transfers'

  const txQuery = useMemo(
    () => ({
      type: tab === 'all' || isTransfersTab ? undefined : tab,
      fundId: filters.fundId,
      categoryId: filters.categoryId,
      from: filters.from,
      to: filters.to,
      q: search || undefined,
      page,
      limit: LIMIT,
    }),
    [tab, filters, search, page, isTransfersTab],
  )

  const transferQuery = useMemo(
    () => ({
      from: filters.from,
      to: filters.to,
      page,
      limit: LIMIT,
    }),
    [filters.from, filters.to, page],
  )

  const { data: txData, isLoading: txLoading } = useTransactions(txQuery)
  const { data: transferData, isLoading: transferLoading } = useTransfers(transferQuery)

  const isLoading = isTransfersTab ? transferLoading : txLoading

  const rows: TableRow[] = useMemo(() => {
    if (isTransfersTab) {
      return (transferData?.data ?? []).map((t: Transfer) => ({ kind: 'transfer', data: t }))
    }
    return (txData?.data ?? []).map((t: Transaction) => ({ kind: 'transaction', data: t }))
  }, [isTransfersTab, txData, transferData])

  const total = isTransfersTab ? (transferData?.total ?? 0) : (txData?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const filtersActive = [filters.fundId, filters.categoryId, filters.from, filters.to].filter(Boolean).length

  function handleTabChange(value: TabValue) {
    setTab(value)
    setPage(1)
  }

  function handleFiltersChange(next: TransactionFilters) {
    setFilters(next)
    setPage(1)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleReassign(transactionId: string, newFundId: string) {
    updateTransaction({ id: transactionId, payload: { fundId: newFundId } })
  }

  // active filter chips
  const dateChip = formatChipDate(filters.from, filters.to)
  const fundChip = filters.fundId ? (funds.find((f) => f.id === filters.fundId)?.name ?? null) : null

  return (
    <div>
      <TransactionsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        filtersActive={filtersActive}
        filters={filters}
        funds={funds}
        categories={categories}
        onFiltersChange={handleFiltersChange}
        onNew={() => setModalTransaction('new')}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <TransactionsTabs value={tab} onChange={handleTabChange} />

        {/* active filter chips */}
        {(dateChip || fundChip) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {dateChip && (
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, padding: '5px 10px', borderRadius: 8, background: 'var(--info-bg)', color: 'var(--info)', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => handleFiltersChange({ ...filters, from: undefined, to: undefined })}
              >
                {dateChip}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </span>
            )}
            {fundChip && (
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, padding: '5px 10px', borderRadius: 8, background: 'var(--card-2)', color: 'var(--muted)', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => handleFiltersChange({ ...filters, fundId: undefined })}
              >
                {fundChip}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </span>
            )}
          </div>
        )}
      </div>

      {!isLoading && (
        <TransactionsTable
          rows={rows}
          funds={funds}
          categories={categories}
          onRowClick={(transaction) => setModalTransaction(transaction)}
          onReassign={handleReassign}
        />
      )}

      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 4px' }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            Mostrando <b style={{ color: 'var(--text)' }}>{rows.length}</b> de {total} {isTransfersTab ? 'transferencias' : 'transacciones'}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {modalTransaction && (
        <TransactionFormModal
          transaction={modalTransaction === 'new' ? null : modalTransaction}
          onClose={() => setModalTransaction(null)}
        />
      )}
    </div>
  )
}
