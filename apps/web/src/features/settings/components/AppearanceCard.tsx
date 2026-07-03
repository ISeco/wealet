import { useTheme } from '../../../app/theme'
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs'
import { updateProfile } from '../api'
import { card } from '../styles'

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Claro' },
  { value: 'dark' as const, label: 'Oscuro' },
]

export function AppearanceCard() {
  const { theme, toggleTheme } = useTheme()

  function handleTheme(target: 'light' | 'dark') {
    if (theme !== target) toggleTheme()
    updateProfile({ theme: target }).catch(() => {})
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>Apariencia</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
            El navy de marca es la superficie en modo oscuro.
          </div>
        </div>
        <SegmentedTabs options={THEME_OPTIONS} value={theme} onChange={handleTheme} />
      </div>
    </div>
  )
}
