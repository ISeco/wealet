const STEPS = [
  { n: 1, label: 'Subir archivo' },
  { n: 2, label: 'Revisar' },
  { n: 3, label: 'Listo' },
]

interface Props {
  currentStep: 1 | 2 | 3
}

export function StepIndicator({ currentStep }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
      {STEPS.map((step) => {
        const done = currentStep > step.n
        const active = currentStep === step.n
        const circBg = done || active ? 'var(--grad)' : 'var(--card-2)'
        const circColor = done || active ? '#fff' : 'var(--muted)'
        const lblColor = active ? 'var(--text)' : 'var(--muted)'
        return (
          <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                background: circBg,
                color: circColor,
                flex: 'none',
              }}
            >
              {done ? '✓' : step.n}
            </span>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: lblColor,
                marginRight: step.n < STEPS.length ? 22 : 0,
              }}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
