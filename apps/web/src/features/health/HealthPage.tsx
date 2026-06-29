import { useMemo, useState } from 'react'
import {
  useActivateFramework,
  useAllocation,
  useHealthAssessment,
  useHealthProfile,
  useUpdateMonthlyIncome,
} from './hooks'
import type { HealthFramework } from './types'
import { FRAMEWORK_DESCRIPTIONS, computeScore } from './utils'
import { AdherenceChart } from './components/AdherenceChart'
import { AllocationChip } from './components/AllocationChip'
import { AllocationDrawer } from './components/AllocationDrawer'
import { FrameworkTabs } from './components/FrameworkTabs'
import { ScoreCard } from './components/ScoreCard'
import { useFunds } from '../funds/hooks'

export function HealthPage() {
  const { data: profile, isLoading: profileLoading } = useHealthProfile()
  const { data: assessment, isLoading: assessmentLoading } = useHealthAssessment()
  const { data: funds = [] } = useFunds()
  const { data: allocation = null } = useAllocation()
  const activateMutation = useActivateFramework()
  const updateIncomeMutation = useUpdateMonthlyIncome()

  const activeFramework = profile?.framework ?? 'fondos'
  const [selectedFramework, setSelectedFramework] = useState<HealthFramework | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const framework = selectedFramework ?? activeFramework

  const score = useMemo(
    () => computeScore(assessment?.funds ?? []),
    [assessment],
  )

  async function handleActivate() {
    await activateMutation.mutateAsync(framework)
    setSelectedFramework(null)
  }

  async function handleUpdateIncome(value: string) {
    await updateIncomeMutation.mutateAsync(value)
  }

  const isLoading = profileLoading || assessmentLoading

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <FrameworkTabs
          active={framework}
          activeFramework={activeFramework}
          onChange={(fw) => {
            setSelectedFramework(fw === activeFramework ? null : fw)
          }}
        />
        {profile && (
          <AllocationChip
            allocation={allocation}
            onOpen={() => setDrawerOpen(true)}
          />
        )}
      </div>

      {isLoading ? (
        <HealthSkeleton />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
            <ScoreCard
              score={score}
              description={FRAMEWORK_DESCRIPTIONS[framework]}
              selectedFramework={framework}
              activeFramework={activeFramework}
              monthlyIncome={profile?.monthlyIncome ?? null}
              onActivate={handleActivate}
              onUpdateIncome={handleUpdateIncome}
            />
            <AdherenceChart
              funds={assessment?.funds ?? []}
              totalBase={assessment?.totalBase ?? '0'}
              framework={framework}
            />
          </div>
        </>
      )}

      {profile && (
        <AllocationDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          profile={profile}
          funds={funds}
          currentAllocation={allocation}
        />
      )}
    </div>
  )
}

function HealthSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, marginTop: 20 }}>
      <div style={{ background: '#0F2240', borderRadius: 14, minHeight: 220, opacity: 0.6 }} />
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, minHeight: 220 }} />
    </div>
  )
}
