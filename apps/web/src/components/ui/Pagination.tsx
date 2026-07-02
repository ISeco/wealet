import type { CSSProperties } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function buttonStyle(active: boolean): CSSProperties {
  return {
    width: 32,
    height: 32,
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: active ? 'var(--card-2)' : 'var(--card)',
    color: active ? 'var(--text)' : 'var(--muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
  }
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 2),
    Math.max(0, page - 2) + 3,
  )

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} style={buttonStyle(false)}>
        <ChevronLeftIcon />
      </button>
      {pages.map((p) => (
        <button key={p} type="button" onClick={() => onPageChange(p)} style={buttonStyle(p === page)}>
          {p}
        </button>
      ))}
      <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} style={buttonStyle(false)}>
        <ChevronRightIcon />
      </button>
    </div>
  )
}
