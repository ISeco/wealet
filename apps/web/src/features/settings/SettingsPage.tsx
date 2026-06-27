import { AppearanceCard } from './components/AppearanceCard'
import { DataAccountGrid } from './components/DataAccountGrid'
import { PreferencesCard } from './components/PreferencesCard'
import { ProfileCard } from './components/ProfileCard'
import { RunwayCard } from './components/RunwayCard'
import { SecurityCard } from './components/SecurityCard'

export function SettingsPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '8px 0 32px' }}>
      <ProfileCard />
      <SecurityCard />
      <PreferencesCard />
      <RunwayCard />
      <AppearanceCard />
      <DataAccountGrid />
    </div>
  )
}
