import { useMemo, useState } from 'react'
import { useActivateFramework, useHealthAssessment, useHealthProfile } from './hooks'
import type { HealthFramework } from './types'
import { FRAMEWORK_DESCRIPTIONS, computeScore, getRecommendations } from './utils'
import { AdherenceChart } from './components/AdherenceChart'
import { FrameworkTabs } from './components/FrameworkTabs'
import { RecommendationCards } from './components/RecommendationCards'
import { ScoreCard } from './components/ScoreCard'

export function HealthPage() {
  const { data: profile, isLoading: profileLoading } = useHealthProfile()
  const { data: assessment, isLoading: assessmentLoading } = useHealthAssessment()
  const activateMutation = useActivateFramework()

  const activeFramework = profile?.framework ?? 'fondos'
  const [selectedFramework, setSelectedFramework] = useState<HealthFramework | null>(null)

  const framework = selectedFramework ?? activeFramework

  const score = useMemo(
    () => computeScore(assessment?.funds ?? []),
    [assessment],
  )

  const recommendations = useMemo(
    () => getRecommendations(assessment?.funds ?? []),
    [assessment],
  )

  async function handleActivate() {
    await activateMutation.mutateAsync(framework)
    setSelectedFramework(null)
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
              onActivate={handleActivate}
            />
            <AdherenceChart
              funds={assessment?.funds ?? []}
              totalBase={assessment?.totalBase ?? '0'}
              framework={framework}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 14 }}>Recomendaciones</div>
            <RecommendationCards recommendations={recommendations} />
          </div>
        </>
      )}
    </div>
  )
}

function HealthSkeleton() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        <div style={{ background: '#0F2240', borderRadius: 14, minHeight: 220, opacity: 0.6 }} />
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, minHeight: 220 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 20 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, height: 110 }} />
        ))}
      </div>
    </>
  )
}
