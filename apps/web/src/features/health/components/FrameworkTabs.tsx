import type { HealthFramework } from '../types'
import { FRAMEWORK_LABELS } from '../utils'

const FRAMEWORKS: HealthFramework[] = ['50_30_20', 'jars_eker', 'profit_first', 'fondos']

interface Props {
  active: HealthFramework
  activeFramework: HealthFramework
  onChange: (fw: HealthFramework) => void
}

export function FrameworkTabs({ active, activeFramework, onChange }: Props) {
  return (
    <div style={{ display: 'inline-flex', padding: 3, background: 'var(--card-2)', border: '1px solid var(--border)', borderRadius: 10, gap: 3, marginBottom: 20 }}>
      {FRAMEWORKS.map((fw) => {
        const isSelected = fw === active
        const isLive = fw === activeFramework
        return (
          <button
            key={fw}
            onClick={() => onChange(fw)}
            style={{
              padding: '7px 15px',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: isSelected ? 600 : 400,
              cursor: 'pointer',
              border: 'none',
              fontFamily: 'inherit',
              transition: 'all .15s',
              background: isSelected ? 'var(--card)' : 'transparent',
              color: isSelected ? 'var(--text)' : 'var(--muted)',
              boxShadow: isSelected ? 'var(--shadow)' : 'none',
              position: 'relative',
            }}
          >
            {FRAMEWORK_LABELS[fw]}
            {isLive && !isSelected && (
              <span style={{
                position: 'absolute',
                top: 5,
                right: 6,
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--res)',
              }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
