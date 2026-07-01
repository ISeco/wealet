import { useState, type SubmitEvent } from 'react'

interface Props {
  fileName: string
  isPending: boolean
  error: string | null
  onSubmit: (year: number) => void
  onBack?: () => void
  /** When false, the card renders no action buttons — an external button
   * elsewhere in the page submits this form via the `form={formId}` HTML
   * attribute instead. Used when the page already has its own footer nav. */
  showActions?: boolean
  formId?: string
}

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_FORM_ID = 'year-prompt-form'

export function YearPromptStep({
  fileName,
  isPending,
  error,
  onSubmit,
  onBack,
  showActions = true,
  formId = DEFAULT_FORM_ID,
}: Props) {
  const [year, setYear] = useState(String(CURRENT_YEAR))

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const parsed = Number(year)
    if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) return
    onSubmit(parsed)
  }

  return (
    <form
      id={formId}
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
      {showActions && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isPending}
              style={{
                height: 40,
                padding: '0 18px',
                border: '1px solid var(--border)',
                borderRadius: 9,
                background: 'var(--card)',
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: 13.5,
                fontWeight: 500,
                cursor: isPending ? 'default' : 'pointer',
                opacity: isPending ? 0.6 : 1,
              }}
            >
              ← Volver
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            style={{
              height: 40,
              padding: '0 20px',
              border: 'none',
              borderRadius: 9,
              background: isPending ? 'var(--card-2)' : 'var(--grad)',
              color: isPending ? 'var(--muted)' : '#fff',
              fontFamily: 'inherit',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isPending ? 'default' : 'pointer',
              boxShadow: isPending ? 'none' : 'var(--shadow)',
            }}
          >
            {isPending ? 'Analizando…' : 'Continuar'}
          </button>
        </div>
      )}
    </form>
  )
}
