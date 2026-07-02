import { useEffect, useMemo, useState } from 'react'
import { activeFunds, useFundsAll } from '../funds'
import { useCategories } from '../categories'
import { Pagination } from '../../components/ui/Pagination'
import { CloseIcon } from '../../components/ui/icons'
import { useActivity, useUpdateTransaction } from './hooks'
import { exportTransactions } from './api'
import { TransactionsToolbar } from './TransactionsToolbar'
import { TransactionsTabs } from './TransactionsTabs'
import { TransactionsTable, type TableRow } from './TransactionsTable'
import { TransactionFormModal } from './TransactionFormModal'
import { useTransactionsUrlState } from './useTransactionsUrlState'
import type { Transaction } from './types'
import { buildActivityQuery, formatChipDate, toTableRow } from './utils'

const LIMIT = 20

export function TransactionsPage() {
  const [modalTransaction, setModalTransaction] = useState<Transaction | 'new' | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const {
    searchParams,
    setSearchParams,
    tab,
    search,
    page,
    filters,
    filtersActive,
    setTab,
    setFilters,
    setSearch,
    setPage,
  } = useTransactionsUrlState()

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setModalTransaction('new') // eslint-disable-line react-hooks/set-state-in-effect
      setSearchParams(
        prev => { const n = new URLSearchParams(prev); n.delete('action'); return n },
        { replace: true },
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    sessionStorage.setItem('tx:params', searchParams.toString())
  }, [searchParams])

  const { data: allFunds = [] } = useFundsAll()
  const funds = activeFunds(allFunds)
  const { data: categories = [] } = useCategories()
  const { mutate: updateTransaction } = useUpdateTransaction()

  const activityQuery = useMemo(
    () => buildActivityQuery(tab, filters, search, page, LIMIT),
    [tab, filters, search, page],
  )

  const { data: activityData, isLoading } = useActivity(activityQuery)

  const rows: TableRow[] = useMemo(
    () => (activityData?.data ?? []).map(toTableRow),
    [activityData],
  )

  const total = activityData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  async function handleExport() {
    setIsExporting(true)
    try {
      await exportTransactions(filters.from, filters.to)
    } finally {
      setIsExporting(false)
    }
  }

  function handleReassign(transactionId: string, newFundId: string) {
    updateTransaction({ id: transactionId, payload: { fundId: newFundId } })
  }

  const dateChip = formatChipDate(filters.from, filters.to)
  const fundChip = filters.fundId ? (funds.find((f) => f.id === filters.fundId)?.name ?? null) : null

  const itemLabel = tab === 'transfers' ? 'transferencias' : tab === 'all' ? 'registros' : 'transacciones'

  return (
    <div>
      <TransactionsToolbar
        search={search}
        onSearchChange={setSearch}
        filtersActive={filtersActive}
        filters={filters}
        funds={funds}
        categories={categories}
        onFiltersChange={setFilters}
        onNew={() => setModalTransaction('new')}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <TransactionsTabs value={tab} onChange={setTab} />

        {/* active filter chips */}
        {(dateChip || fundChip) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {dateChip && (
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, padding: '5px 10px', borderRadius: 8, background: 'var(--info-bg)', color: 'var(--info)', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => setFilters({ ...filters, from: undefined, to: undefined })}
              >
                {dateChip}
                <CloseIcon size={13} />
              </span>
            )}
            {fundChip && (
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, padding: '5px 10px', borderRadius: 8, background: 'var(--card-2)', color: 'var(--muted)', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => setFilters({ ...filters, fundId: undefined })}
              >
                {fundChip}
                <CloseIcon size={13} />
              </span>
            )}
          </div>
        )}
      </div>

      {!isLoading && (
        <TransactionsTable
          rows={rows}
          funds={funds}
          allFunds={allFunds}
          categories={categories}
          onRowClick={(transaction) => setModalTransaction(transaction)}
          onReassign={handleReassign}
        />
      )}

      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 4px' }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            Mostrando <b style={{ color: 'var(--text)' }}>{rows.length}</b> de {total} {itemLabel}
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
