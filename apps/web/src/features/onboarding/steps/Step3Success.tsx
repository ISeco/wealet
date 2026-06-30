import { useNavigate } from 'react-router-dom'
import { useNetWorth } from '../../dashboard/hooks'
import { formatMoney } from '../../../lib/money'

const PRESET_NAMES: Record<string, string> = {
  jars_eker: 'Jars of Eker',
  '50_30_20': 'Regla 50/30/20',
  profit_first: 'Profit First',
  fondos: 'Fondos propios',
  excel: 'tu importación Excel',
}

interface Props {
  preset: string
  displayName: string | null
  isReconfigure?: boolean
}

export function Step3Success({ preset, displayName, isReconfigure }: Props) {
  const navigate = useNavigate()
  const { data: netWorth, isLoading } = useNetWorth()
  const name = displayName ?? 'todo'
  const presetName = PRESET_NAMES[preset] ?? preset
  const total = netWorth
    ? BigInt(netWorth.available) + BigInt(netWorth.reserve) + BigInt(netWorth.committed)
    : null

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 78, height: 78, borderRadius: 22, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-lg)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)' }}>
        Todo listo, {name}.
      </div>
      <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 10, maxWidth: 440, margin: '10px auto 0' }}>
        Tu espacio con <b style={{ color: 'var(--text)' }}>{presetName}</b> está creado. Registra tu primer movimiento o importa tu historial cuando quieras.
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '32px 0 8px' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>
            {isLoading || total === null ? '—' : formatMoney(total.toString(), 'CLP')}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>patrimonio inicial</div>
        </div>
        <div style={{ width: 1, background: 'var(--border)' }} />
        <div>
          <div style={{ fontSize: 24, fontWeight: 600, fontVariantNumeric: 'tabular-nums', background: 'var(--grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>CLP</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>moneda</div>
        </div>
      </div>
      <button
        onClick={() => navigate(isReconfigure ? '/ajustes' : '/')}
        style={{ marginTop: 8, height: 46, padding: '0 30px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)' }}
      >
        {isReconfigure ? 'Volver a Ajustes' : 'Ir al dashboard'}
      </button>
    </div>
  )
}
