import { useMemo, useState } from 'react'
import { useFunds } from '../funds'
import { useCategories } from '../categories'
import { Pagination } from '../../components/ui/Pagination'
import { useActivity, useUpdateTransaction } from './hooks'
import { TransactionsToolbar } from './TransactionsToolbar'
import { TransactionsTabs, type TabValue } from './TransactionsTabs'
import { TransactionsTable, type TableRow } from './TransactionsTable'
import { TransactionFormModal } from './TransactionFormModal'
import type { ActivityItem, ActivitySubtype, ActivityType, Transaction, TransactionFilters } from './types'

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

function toTableRow(item: ActivityItem): TableRow {
  if (item.type === 'transfer') {
    return {
      kind: 'transfer',
      data: {
        id: item.id,
        fromFundId: item.fromFundId!,
        toFundId: item.toFundId!,
        amount: item.amount,
        amountFormatted: item.amountFormatted,
        currency: item.currency,
        occurredOn: item.occurredOn,
        note: item.note ?? null,
        createdAt: item.createdAt,
      },
    }
  }
  return {
    kind: 'transaction',
    data: {
      id: item.id,
      fundId: item.fundId!,
      categoryId: item.categoryId!,
      type: item.subtype!,
      amount: item.amount,
      amountFormatted: item.amountFormatted,
      currency: item.currency,
      description: item.description ?? null,
      occurredOn: item.occurredOn,
      source: item.source!,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt ?? item.createdAt,
    },
  }
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
  }, [tab, filters, search, page])

  const { data: activityData, isLoading } = useActivity(activityQuery)

  const rows: TableRow[] = useMemo(
    () => (activityData?.data ?? []).map(toTableRow),
    [activityData],
  )

  const total = activityData?.total ?? 0
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
