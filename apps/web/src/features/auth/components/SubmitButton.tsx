interface SubmitButtonProps {
  submitting: boolean
  label: string
  submittingLabel: string
}

export function SubmitButton({ submitting, label, submittingLabel }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={submitting}
      style={{
        width: '100%',
        height: 46,
        border: 'none',
        borderRadius: 9,
        background: 'var(--grad)',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 14.5,
        fontWeight: 600,
        cursor: submitting ? 'default' : 'pointer',
        opacity: submitting ? 0.7 : 1,
        boxShadow: 'var(--shadow)',
        marginTop: 4,
      }}
    >
      {submitting ? submittingLabel : label}
    </button>
  )
}
