import type { ImportCommitResultDto } from '../types'
import { Button } from '../../../components/ui/Button'
import { CheckIcon } from '../../../components/ui/icons'

interface Props {
  result: ImportCommitResultDto
  displayName: string | null
  onImportAnother: () => void
  onGoToTransactions: () => void
}

export function SuccessStep({ result, displayName, onImportAnother, onGoToTransactions }: Props) {
  const greeting = displayName ? `¡Listo, ${displayName}!` : '¡Listo!'
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: 'var(--shadow)',
        padding: '56px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'var(--pos-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
        }}
      >
        <CheckIcon color="var(--pos)" size={30} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{greeting}</div>
      <div
        style={{
          fontSize: 14,
          color: 'var(--muted)',
          marginTop: 8,
          maxWidth: 380,
          margin: '8px auto 0',
          lineHeight: 1.55,
        }}
      >
        Se importaron <strong style={{ color: 'var(--text)' }}>{result.imported} transacciones</strong> y se distribuyeron en tus fondos.
        {result.createdFunds.length > 0 && (
          <> Se crearon <strong style={{ color: 'var(--text)' }}>{result.createdFunds.length} fondos nuevos</strong>.</>
        )} Tu patrimonio está al día.
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
        <Button variant="secondary" onClick={onImportAnother}>
          Importar otro
        </Button>
        <Button onClick={onGoToTransactions}>
          Ver transacciones
        </Button>
      </div>
    </div>
  )
}
