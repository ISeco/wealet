import type { ImportCommitResultDto } from '../types'

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
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--pos)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
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
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
        <button
          onClick={onImportAnother}
          style={{
            height: 42,
            padding: '0 18px',
            border: '1px solid var(--border)',
            borderRadius: 9,
            background: 'var(--card)',
            color: 'var(--text)',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Importar otro
        </button>
        <button
          onClick={onGoToTransactions}
          style={{
            height: 42,
            padding: '0 20px',
            border: 'none',
            borderRadius: 9,
            background: 'var(--grad)',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow)',
          }}
        >
          Ver transacciones
        </button>
      </div>
    </div>
  )
}
