import { Button } from '../../../components/ui/Button'
import { formatThousands } from '../../../lib/money'

interface Props {
  rawIncome: string
  onChangeIncome: (rawIncome: string) => void
  onConfirm: () => void
}

export function AllocationIncomeStep({ rawIncome, onChangeIncome, onConfirm }: Props) {
  const total = BigInt(rawIncome || '0')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>
        ¿Cuánto recibiste este mes? Ingresa el monto total de tu ingreso en CLP.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', background: 'var(--card-2)' }}>
        <span style={{ color: 'var(--muted)', fontWeight: 600 }}>$</span>
        <input
          type="text"
          inputMode="numeric"
          value={formatThousands(rawIncome)}
          onChange={(e) => onChangeIncome(e.target.value.replace(/\D/g, ''))}
          placeholder="1.000.000"
          style={{
            flex: 1, border: 'none', background: 'none',
            fontSize: 15, fontWeight: 600, color: 'var(--text)',
            outline: 'none', fontFamily: 'inherit',
          }}
          autoFocus
        />
      </div>
      <Button
        onClick={onConfirm}
        disabled={total <= 0n}
        style={{ width: '100%' }}
      >
        Continuar →
      </Button>
    </div>
  )
}
