import { useMemo, useState } from 'react'
import { useActivateFramework, useHealthAssessment, useHealthProfile, useUpdateMonthlyIncome } from './hooks'
import type { HealthFramework } from './types'
import { FRAMEWORK_DESCRIPTIONS, computeScore } from './utils'
import { AdherenceChart } from './components/AdherenceChart'
import { FrameworkTabs } from './components/FrameworkTabs'
import { ScoreCard } from './components/ScoreCard'

export function HealthPage() {
  const { data: profile, isLoading: profileLoading } = useHealthProfile()
  const { data: assessment, isLoading: assessmentLoading } = useHealthAssessment()
  const activateMutation = useActivateFramework()
  const updateIncomeMutation = useUpdateMonthlyIncome()

  const activeFramework = profile?.framework ?? 'fondos'
  const [selectedFramework, setSelectedFramework] = useState<HealthFramework | null>(null)

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
      <FrameworkTabs
        active={framework}
        activeFramework={activeFramework}
        onChange={(fw) => {
          setSelectedFramework(fw === activeFramework ? null : fw)
        }}
      />

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
    </div>
  )
}

function HealthSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
      <div style={{ background: '#0F2240', borderRadius: 14, minHeight: 220, opacity: 0.6 }} />
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, minHeight: 220 }} />
    </div>
  )
}
