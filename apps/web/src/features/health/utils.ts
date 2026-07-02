import type { FundAssessment, FundClassification, HealthFramework } from './types'

export const FRAMEWORK_LABELS: Record<HealthFramework, string> = {
  '50_30_20':    'Regla 50 / 30 / 20',
  'jars_eker':   'Jars de Eker',
  'profit_first': 'Profit First',
  'fondos':      'Fondos con propósito',
}

export const FRAMEWORK_FUND_COUNT: Record<HealthFramework, number> = {
  '50_30_20':    3,
  'jars_eker':   6,
  'profit_first': 4,
  'fondos':      0,
}

export const ALL_FRAMEWORKS = Object.keys(FRAMEWORK_LABELS) as HealthFramework[]

/** Prefix of `Fund.frameworkSlot` for frameworks that tag funds by slot. `fondos` has none. */
const FRAMEWORK_SLOT_PREFIX: Partial<Record<HealthFramework, string>> = {
  '50_30_20':    '50_30_20_',
  'jars_eker':   'jars_',
  'profit_first': 'profit_first:',
}

export function frameworkSlotPrefix(framework: HealthFramework): string | null {
  return FRAMEWORK_SLOT_PREFIX[framework] ?? null
}

export function isSlotFramework(framework: HealthFramework): boolean {
  return framework in FRAMEWORK_SLOT_PREFIX
}

export const FRAMEWORK_ACTIVATE_WARNING: Record<HealthFramework, string> = {
  '50_30_20':    'Se crearán 3 fondos: Necesidades, Deseos y Ahorro. Tus fondos actuales se mantienen pero no serán evaluados en este framework.',
  'jars_eker':   'Se crearán 6 fondos basados en el sistema de T. Harv Eker. Tus fondos actuales se mantienen pero no serán evaluados en este framework.',
  'profit_first': 'Se crearán 4 fondos: Estilo de Vida, Diversión, Inversión y Seguridad. Tus fondos actuales se mantienen pero no serán evaluados en este framework.',
  'fondos':      'Pasarás al modo flexible. Tus fondos personalizados (sin asignación a otro framework) serán evaluados.',
}

export const FRAMEWORK_DESCRIPTIONS: Record<HealthFramework, string> = {
  'fondos':      'Cada peso vive en un fondo con un propósito. Mide si tus saldos siguen el plan.',
  '50_30_20':    '50% necesidades · 30% deseos · 20% ahorro, sobre tus ingresos del mes.',
  'jars_eker':   'Reparte cada ingreso en 6 frascos con porcentajes fijos.',
  'profit_first': 'Distribuye por propósito antes de cubrir gastos. Inspirado en el libro de Mike Michalowicz.',
}

export function computeScore(funds: FundAssessment[]): number {
  if (funds.length === 0) return 0
  const totalDeviation = funds.reduce(
    (sum, f) => sum + Math.abs(f.actualPercentage - f.targetPercentage),
    0,
  )
  return Math.max(0, Math.round(100 - totalDeviation))
}

export interface Recommendation {
  title: string
  description: string
  iconBg: string
  iconColor: string
  icon: 'up' | 'down' | 'check'
}

const RECS: Record<
  FundClassification,
  { under: Omit<Recommendation, 'icon'>; over: Omit<Recommendation, 'icon'>; ok: Omit<Recommendation, 'icon'> }
> = {
  available: {
    under: {
      title: 'Libera más dinero disponible',
      description: 'Tu fondo disponible está por debajo del objetivo. Considera mover dinero desde comprometidos que no uses.',
      iconBg: 'rgba(234,179,8,0.12)',
      iconColor: '#CA8A04',
    },
    over: {
      title: 'Disponible por encima del plan',
      description: 'Tienes más de lo planeado en disponible. Podrías mover el exceso a reserva o comprometidos.',
      iconBg: 'rgba(59,130,246,0.12)',
      iconColor: '#2563EB',
    },
    ok: {
      title: 'Disponible en equilibrio',
      description: 'Tu distribución de gastos del día a día está alineada con el objetivo.',
      iconBg: 'rgba(22,168,154,0.12)',
      iconColor: '#16A89A',
    },
  },
  reserve: {
    under: {
      title: 'Refuerza tu reserva',
      description: 'Tu colchón de ahorro está por debajo del objetivo. Intenta mover más dinero a fondos de reserva.',
      iconBg: 'rgba(234,179,8,0.12)',
      iconColor: '#CA8A04',
    },
    over: {
      title: 'Reserva por encima del plan',
      description: 'Tienes más reserva de lo planificado. Puedes considerar mover el exceso a disponible o comprometidos.',
      iconBg: 'rgba(59,130,246,0.12)',
      iconColor: '#2563EB',
    },
    ok: {
      title: 'Reserva en línea con el plan',
      description: 'Tu fondo de emergencia y ahorro está bien balanceado según tu framework.',
      iconBg: 'rgba(22,168,154,0.12)',
      iconColor: '#16A89A',
    },
  },
  committed: {
    under: {
      title: 'Compromisos por debajo del plan',
      description: 'Tus gastos fijos no alcanzan el objetivo. Revisa si hay compromisos sin categorizar.',
      iconBg: 'rgba(234,179,8,0.12)',
      iconColor: '#CA8A04',
    },
    over: {
      title: 'Compromisos elevados',
      description: 'Tus gastos fijos superan el objetivo. Considera revisar qué compromisos puedes reducir.',
      iconBg: 'rgba(239,68,68,0.12)',
      iconColor: '#DC2626',
    },
    ok: {
      title: 'Compromisos bajo control',
      description: 'Tus gastos fijos están dentro del rango esperado por tu framework.',
      iconBg: 'rgba(22,168,154,0.12)',
      iconColor: '#16A89A',
    },
  },
}

export function getRecommendations(funds: FundAssessment[]): Recommendation[] {
  // Aggregate per classification so jars_eker/fondos never produce duplicate cards
  const groups = new Map<FundClassification, { totalActual: number; totalTarget: number }>()
  for (const fund of funds) {
    const g = groups.get(fund.classification) ?? { totalActual: 0, totalTarget: 0 }
    groups.set(fund.classification, {
      totalActual: g.totalActual + fund.actualPercentage,
      totalTarget: g.totalTarget + fund.targetPercentage,
    })
  }

  return Array.from(groups.entries()).map(([classification, { totalActual, totalTarget }]) => {
    const diff = totalActual - totalTarget
    const rec = RECS[classification]
    if (diff < -5) return { ...rec.under, icon: 'down' as const }
    if (diff > 5)  return { ...rec.over,  icon: 'up' as const }
    return { ...rec.ok, icon: 'check' as const }
  })
}
