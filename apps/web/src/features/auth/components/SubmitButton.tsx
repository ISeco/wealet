interface SubmitButtonProps {
  submitting: boolean
  label: string
  submittingLabel: string
  disabled?: boolean
}

export function SubmitButton({ submitting, label, submittingLabel, disabled }: SubmitButtonProps) {
  const isDisabled = submitting || !!disabled
  return (
    <button
      type="submit"
      disabled={isDisabled}
      style={{
        width: '100%',
        height: 46,
        border: 'none',
        borderRadius: 9,
        background: isDisabled ? 'var(--border)' : 'var(--grad)',
        color: isDisabled ? 'var(--muted)' : '#fff',
        fontFamily: 'inherit',
        fontSize: 14.5,
        fontWeight: 600,
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: submitting ? 0.7 : 1,
        boxShadow: isDisabled ? 'none' : 'var(--shadow)',
        marginTop: 4,
      }}
    >
      {submitting ? submittingLabel : label}
    </button>
  )
}
