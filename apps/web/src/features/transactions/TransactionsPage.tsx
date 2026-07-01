import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFundsAll } from '../funds'
import { useCategories } from '../categories'
import { Pagination } from '../../components/ui/Pagination'
import { useActivity, useUpdateTransaction } from './hooks'
import { exportTransactions } from './api'
import { TransactionsToolbar } from './TransactionsToolbar'
import { TransactionsTabs, type TabValue } from './TransactionsTabs'
import { TransactionsTable, type TableRow } from './TransactionsTable'
import { TransactionFormModal } from './TransactionFormModal'
import type { ActivitySubtype, ActivityType, Transaction, TransactionFilters } from './types'
import { formatChipDate, toTableRow } from './utils'

const LIMIT = 20

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalTransaction, setModalTransaction] = useState<Transaction | 'new' | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const tab = (searchParams.get('tab') as TabValue) ?? 'all'
  const search = searchParams.get('q') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const filters: TransactionFilters = {
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    fundId: searchParams.get('fundId') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
  }

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
  const funds = allFunds.filter((f) => !f.archivedAt)
  const { data: categories = [] } = useCategories()
  const { mutate: updateTransaction } = useUpdateTransaction()

  const activityQuery = useMemo(() => {
    let type: ActivityType | undefined
    let subtype: ActivitySubtype | undefined

    if (tab === 'transfers') {
      type = 'transfer'
    } else if (tab === 'income' || tab === 'expense') {
      type = 'transaction'
      subtype = tab
    }

    return {
      from: filters.from,
      to: filters.to,
      type,
      subtype,
      fundId: filters.fundId,
      categoryId: filters.categoryId,
      q: search || undefined,
      page,
      limit: LIMIT,
    }
  }, [tab, filters.from, filters.to, filters.fundId, filters.categoryId, search, page])

  const { data: activityData, isLoading } = useActivity(activityQuery)

  const rows: TableRow[] = useMemo(
    () => (activityData?.data ?? []).map(toTableRow),
    [activityData],
  )

  const total = activityData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const filtersActive = [filters.fundId, filters.categoryId, filters.from, filters.to].filter(Boolean).length

  function handleTabChange(value: TabValue) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === 'all') { next.delete('tab') } else { next.set('tab', value) }
      next.delete('page')
      return next
    })
  }

  function handleFiltersChange(next: TransactionFilters) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      if (next.from) { params.set('from', next.from) } else { params.delete('from') }
      if (next.to) { params.set('to', next.to) } else { params.delete('to') }
      if (next.fundId) { params.set('fundId', next.fundId) } else { params.delete('fundId') }
      if (next.categoryId) { params.set('categoryId', next.categoryId) } else { params.delete('categoryId') }
      params.delete('page')
      return params
    })
  }

  function handleSearchChange(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) { next.set('q', value) } else { next.delete('q') }
      next.delete('page')
      return next
    })
  }

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newPage === 1) { next.delete('page') } else { next.set('page', String(newPage)) }
      return next
    })
  }

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
        onSearchChange={handleSearchChange}
        filtersActive={filtersActive}
        filters={filters}
        funds={funds}
        categories={categories}
        onFiltersChange={handleFiltersChange}
        onNew={() => setModalTransaction('new')}
        onExport={handleExport}
        isExporting={isExporting}
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
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
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
