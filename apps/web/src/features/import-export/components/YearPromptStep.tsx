import { useState, type SubmitEvent } from 'react'

interface Props {
  fileName: string
  isPending: boolean
  error: string | null
  onSubmit: (year: number) => void
}

const CURRENT_YEAR = new Date().getFullYear()

export function YearPromptStep({ fileName, isPending, error, onSubmit }: Props) {
  const [year, setYear] = useState(String(CURRENT_YEAR))

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const parsed = Number(year)
    if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) return
    onSubmit(parsed)
  }

  return (
    <form
      onSubmit={handleSubmit}
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
        value={year}
        onChange={(e) => setYear(e.target.value)}
        disabled={isPending}
        style={{
          width: 120,
          height: 40,
          textAlign: 'center',
          fontSize: 15,
          border: '1px solid var(--border)',
          borderRadius: 9,
          marginBottom: 16,
        }}
      />
      {error && (
        <div style={{ fontSize: 13, color: 'var(--neg)', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <div>
        <button
          type="submit"
          disabled={isPending}
          style={{
            height: 40,
            padding: '0 20px',
            border: 'none',
            borderRadius: 9,
            background: 'var(--info)',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isPending ? 'Analizando…' : 'Continuar'}
        </button>
      </div>
    </form>
  )
}
