import { SegmentedTabs } from '../../../components/ui/SegmentedTabs'
import type { HealthFramework } from '../types'
import { ALL_FRAMEWORKS, FRAMEWORK_LABELS } from '../utils'

interface Props {
  active: HealthFramework
  activeFramework: HealthFramework
  onChange: (fw: HealthFramework) => void
}

export function FrameworkTabs({ active, activeFramework, onChange }: Props) {
  return (
    <SegmentedTabs
      value={active}
      onChange={onChange}
      options={ALL_FRAMEWORKS.map((fw) => {
        const isSelected = fw === active
        const isLive = fw === activeFramework
        return {
          value: fw,
          label: (
            <>
              {FRAMEWORK_LABELS[fw]}
              {isLive && !isSelected && (
                <span style={{ position: 'absolute', top: 5, right: 6, width: 5, height: 5, borderRadius: '50%', background: 'var(--res)' }} />
              )}
            </>
          ),
        }
      })}
    />
  )
}
