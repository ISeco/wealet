export type PresetOption = 'jars_eker' | '50_30_20' | 'profit_first' | 'fondos' | 'excel'

interface PresetCard {
  id: PresetOption
  name: string
  description: string
  meta: string
  iconColor: string
  iconBg: string
  icon: React.ReactNode
}

const CARDS: PresetCard[] = [
  {
    id: 'jars_eker',
    name: 'Jars of Eker',
    description: 'Basado en el libro de T. Harv Eker. Divide tus ingresos en 6 fondos con propósitos específicos.',
    meta: '6 fondos · Slots predefinidos',
    iconColor: 'var(--disp)',
    iconBg: 'var(--disp-bg)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
      </svg>
    ),
  },
  {
    id: '50_30_20',
    name: 'Regla 50/30/20',
    description: 'Distribución clásica: 50% necesidades, 30% deseos, 20% ahorro.',
    meta: '3 fondos · Slots predefinidos',
    iconColor: 'var(--res)',
    iconBg: 'var(--res-bg)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
  {
    id: 'profit_first',
    name: 'Profit First',
    description: 'Inspirado en el libro de Mike Michalowicz. Distribuye por propósito antes de cubrir gastos.',
    meta: '4 fondos · Slots predefinidos',
    iconColor: 'var(--comp)',
    iconBg: 'var(--comp-bg)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'fondos',
    name: 'Fondos propios',
    description: 'Crea y nombra tus fondos a medida. Sin estructura predefinida, total flexibilidad.',
    meta: 'Personalizable',
    iconColor: 'var(--pos)',
    iconBg: 'var(--pos-bg)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
]

interface Props {
  selected: PresetOption | null
  onSelect: (preset: PresetOption) => void
}

export function Step1Preset({ selected, onSelect }: Props) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Paso 1 · Tu sistema
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', marginTop: 10 }}>
          ¿Cómo quieres ordenar tu dinero?
        </div>
        <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8, maxWidth: 480, margin: '8px auto 0' }}>
          Elige un punto de partida. Podrás ajustar y renombrar tus fondos cuando quieras.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {CARDS.map((card) => {
          const isSelected = selected === card.id
          return (
            <div
              key={card.id}
              onClick={() => onSelect(card.id)}
              style={{
                position: 'relative',
                textAlign: 'left',
                padding: 22,
                borderRadius: 14,
                cursor: 'pointer',
                border: `1px solid ${isSelected ? 'var(--disp)' : 'var(--border)'}`,
                background: isSelected ? 'var(--tint)' : 'var(--card)',
                boxShadow: isSelected ? '0 0 0 3px rgba(22,168,154,.15)' : 'none',
                transition: 'all .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ width: 44, height: 44, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: card.iconBg, color: card.iconColor }}>
                  {card.icon}
                </span>
                <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--disp)', opacity: isSelected ? 1 : 0, transition: 'opacity .15s' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
              </div>
              <div style={{ fontSize: 16.5, fontWeight: 600, color: 'var(--text)' }}>{card.name}</div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 6 }}>{card.description}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 14, fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 7, padding: '4px 9px' }}>{card.meta}</div>
            </div>
          )
        })}
      </div>

      {/* Excel secondary option */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>¿Ya tienes datos?</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      <div
        onClick={() => onSelect('excel')}
        style={{
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          padding: '13px 20px',
          border: `1px solid ${selected === 'excel' ? 'var(--disp)' : 'var(--border)'}`,
          borderRadius: 12,
          background: selected === 'excel' ? 'var(--tint)' : 'var(--card)',
          cursor: 'pointer',
          transition: 'all .15s',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Importar desde Excel</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </div>
  )
}
