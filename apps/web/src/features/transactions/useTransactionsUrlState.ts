import { useSearchParams } from 'react-router-dom'
import type { TabValue } from './TransactionsTabs'
import type { TransactionFilters } from './types'

export interface TransactionsUrlState {
  searchParams: URLSearchParams
  setSearchParams: ReturnType<typeof useSearchParams>[1]
  tab: TabValue
  search: string
  page: number
  filters: TransactionFilters
  filtersActive: number
  setTab: (value: TabValue) => void
  setFilters: (filters: TransactionFilters) => void
  setSearch: (value: string) => void
  setPage: (page: number) => void
}

export function useTransactionsUrlState(): TransactionsUrlState {
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = (searchParams.get('tab') as TabValue) ?? 'all'
  const search = searchParams.get('q') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const filters: TransactionFilters = {
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    fundId: searchParams.get('fundId') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
  }
  const filtersActive = [filters.fundId, filters.categoryId, filters.from, filters.to].filter(Boolean).length

  function setTab(value: TabValue) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === 'all') { next.delete('tab') } else { next.set('tab', value) }
      next.delete('page')
      return next
    })
  }

  function setFilters(next: TransactionFilters) {
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

  function setSearch(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) { next.set('q', value) } else { next.delete('q') }
      next.delete('page')
      return next
    })
  }

  function setPage(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newPage === 1) { next.delete('page') } else { next.set('page', String(newPage)) }
      return next
    })
  }

  return { searchParams, setSearchParams, tab, search, page, filters, filtersActive, setTab, setFilters, setSearch, setPage }
}
