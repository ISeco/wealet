import { useState } from 'react'
import { CloseIcon, PlusIcon, SearchIcon } from '../../components/ui/icons'
import { DateInput } from '../../components/ui/DateInput'
import { Button } from '../../components/ui/Button'
import type { Fund } from '../funds'
import type { Category } from '../categories'
import type { TransactionFilters } from './types'

interface TransactionsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  filtersActive: number
  filters: TransactionFilters
  funds: Fund[]
  categories: Category[]
  onFiltersChange: (filters: TransactionFilters) => void
  onNew: () => void
  onExport: () => void
  isExporting?: boolean
}

export function TransactionsToolbar({
  search,
  onSearchChange,
  filtersActive,
  filters,
  funds,
  categories,
  onFiltersChange,
  onNew,
  onExport,
  isExporting = false,
}: TransactionsToolbarProps) {
  const [searchInput, setSearchInput] = useState(search)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [draft, setDraft] = useState<TransactionFilters>(filters)

  function openPopover() {
    setDraft(filters)
    setPopoverOpen(true)
  }

  function applyFilters() {
    onFiltersChange(draft)
    setPopoverOpen(false)
  }

  function clearFilters() {
    setDraft({})
    onFiltersChange({})
    setPopoverOpen(false)
  }

  function todayISO(): string {
    return new Date().toISOString().slice(0, 10)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      {/* search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          flex: 1,
          minWidth: 240,
          height: 38,
          padding: '0 12px',
          border: '1px solid var(--border)',
          borderRadius: 9,
          background: 'var(--card)',
        }}
      >
        <SearchIcon />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSearchChange(searchInput) }}
          onBlur={() => onSearchChange(searchInput)}
          placeholder="Buscar transacciones…"
          style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 13.5, color: 'var(--text)' }}
        />
      </div>

      {/* filtros button + popover */}
      <div style={{ position: 'relative' }}>
        <Button type="button" variant="secondary" onClick={openPopover} style={{ height: 38, padding: '0 13px', fontSize: 13 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5h18M6 12h12M10 19h4" />
          </svg>
          Filtros
          {filtersActive > 0 && (
            <span style={{ fontSize: 11, color: '#fff', background: 'var(--info)', borderRadius: 20, padding: '0 6px', fontWeight: 600 }}>
              {filtersActive}
            </span>
          )}
        </Button>

        {popoverOpen && (
          <>
            {/* backdrop para cerrar */}
            <div
              onClick={() => setPopoverOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 29 }}
            />
            <div
              style={{
                position: 'absolute',
                top: 46,
                left: 0,
                zIndex: 30,
                width: 332,
                background: 'var(--card)',
                border: '1px solid var(--border-strong)',
                borderRadius: 13,
                boxShadow: 'var(--shadow-lg)',
                padding: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Filtrar movimientos</span>
                <span onClick={() => setPopoverOpen(false)} style={{ display: 'flex', cursor: 'pointer', color: 'var(--muted)' }}>
                  <CloseIcon size={17} />
                </span>
              </div>

              {/* date range */}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Rango de fechas</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <DateInput
                    value={draft.from ?? ''}
                    placeholder="Desde"
                    onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value || undefined }))}
                    style={{ height: 36, borderRadius: 8 }}
                    maxDate={todayISO()}
                  />
                </div>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>→</span>
                <div style={{ flex: 1 }}>
                  <DateInput
                    value={draft.to ?? ''}
                    placeholder="Hasta"
                    onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value || undefined }))}
                    style={{ height: 36, borderRadius: 8 }}
                    maxDate={todayISO()}
                  />
                </div>
              </div>

              {/* fondos chips */}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Fondo</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                {funds.map((fund) => {
                  const selected = draft.fundId === fund.id
                  return (
                    <span
                      key={fund.id}
                      onClick={() => setDraft((d) => ({ ...d, fundId: selected ? undefined : fund.id }))}
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '5px 11px',
                        borderRadius: 7,
                        cursor: 'pointer',
                        border: `1px solid ${selected ? 'var(--info)' : 'var(--border-strong)'}`,
                        background: selected ? 'var(--info-bg)' : 'var(--card)',
                        color: selected ? 'var(--info)' : 'var(--muted)',
                      }}
                    >
                      {fund.name}
                    </span>
                  )
                })}
              </div>

              {/* categorías chips */}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Categoría</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
                {categories.map((category) => {
                  const selected = draft.categoryId === category.id
                  return (
                    <span
                      key={category.id}
                      onClick={() => setDraft((d) => ({ ...d, categoryId: selected ? undefined : category.id }))}
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '5px 11px',
                        borderRadius: 7,
                        cursor: 'pointer',
                        border: `1px solid ${selected ? 'var(--info)' : 'var(--border-strong)'}`,
                        background: selected ? 'var(--info-bg)' : 'var(--card)',
                        color: selected ? 'var(--info)' : 'var(--muted)',
                      }}
                    >
                      {category.name}
                    </span>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 9, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <Button type="button" variant="secondary" onClick={clearFilters} style={{ flex: 1, height: 38, fontSize: 13 }}>
                  Limpiar
                </Button>
                <Button type="button" onClick={applyFilters} style={{ flex: 1, height: 38, fontSize: 13 }}>
                  Aplicar
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* exportar */}
      <Button type="button" variant="secondary" onClick={onExport} disabled={isExporting} style={{ height: 38, padding: '0 13px', fontSize: 13 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 14V3M12 14l4-4M12 14l-4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        {isExporting ? 'Exportando…' : 'Exportar'}
      </Button>

      {/* nueva */}
      <Button type="button" onClick={onNew} style={{ height: 38, padding: '0 14px', fontSize: 13 }}>
        <PlusIcon />
        Nueva
      </Button>
    </div>
  )
}
