import type { CurrentAllocation } from '../types'

interface Props {
  allocation: CurrentAllocation
  onOpen: () => void
}

function currentMonthName(): string {
  const name = new Date().toLocaleString('es', { month: 'long' })
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function AllocationChip({ allocation, onOpen }: Props) {
  const monthName = currentMonthName()
  const isDone = allocation !== null

  return (
    <button
      onClick={onOpen}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 12px',
        borderRadius: 20,
        border: '1px solid var(--disp)',
        background: 'var(--disp-bg)',
        color: 'var(--disp)',
        fontSize: 12.5,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'opacity .15s',
        whiteSpace: 'nowrap',
      }}
    >
      {isDone ? (
        <span style={{ opacity: 0.65 }}>
          <span style={{ fontSize: 11 }}>✓</span>
          {monthName} distribuido · <span style={{ fontWeight: 600 }}>Redistribuir →</span>
        </span>
      ) : (
        <>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--disp)',
              flexShrink: 0,
            }}
          />
          Distribuir {monthName}
        </>
      )}
    </button>
  )
}
