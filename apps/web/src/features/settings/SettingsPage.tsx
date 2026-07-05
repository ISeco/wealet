import { AppearanceCard } from './components/AppearanceCard'
import { DataAccountGrid } from './components/DataAccountGrid'
import { PreferencesCard } from './components/PreferencesCard'
import { ProfileCard } from './components/ProfileCard'
import { RunwayCard } from './components/RunwayCard'
import { SecurityCard } from './components/SecurityCard'

export function SettingsPage() {
  return (
    <div className="settings-page">
      <ProfileCard />
      <SecurityCard />
      <PreferencesCard />
      <RunwayCard />
      <AppearanceCard />
      <DataAccountGrid />
    </div>
  )
}
