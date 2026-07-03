interface Props {
  fileName: string
  value: string
  onChange: (value: string) => void
  isPending: boolean
  error: string | null
}

export function YearPromptStep({ fileName, value, onChange, isPending, error }: Props) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        ¿A qué año corresponden estos datos?
      </div>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        {fileName}: las hojas de este archivo no incluyen el año en su nombre.
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isPending}
        style={{
          width: 120,
          height: 40,
          textAlign: 'center',
          fontFamily: 'inherit',
          fontSize: 15,
          color: 'var(--text)',
          background: 'var(--field)',
          border: '1px solid var(--border)',
          borderRadius: 9,
        }}
      />
      {error && (
        <div style={{ fontSize: 13, color: 'var(--neg)', marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  )
}
