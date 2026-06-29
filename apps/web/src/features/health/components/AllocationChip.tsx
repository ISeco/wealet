import type { CurrentAllocation } from '../types'

interface Props {
  allocation: CurrentAllocation
  onOpen: () => void
}

function currentMonthName(): string {
  return new Date().toLocaleString('es', { month: 'long' })
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
        border: '1px solid rgba(22,168,154,0.25)',
        background: 'rgba(22,168,154,0.10)',
        color: isDone ? 'rgba(22,168,154,0.65)' : '#16A89A',
        fontSize: 12.5,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'opacity .15s',
        whiteSpace: 'nowrap',
      }}
    >
      {isDone ? (
        <>
          <span style={{ fontSize: 11 }}>✓</span>
          {monthName} distribuido · <span style={{ fontWeight: 600 }}>Redistribuir →</span>
        </>
      ) : (
        <>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#16A89A',
              flexShrink: 0,
            }}
          />
          Distribuir {monthName}
        </>
      )}
    </button>
  )
}
