import { Button } from '../../../components/ui/Button'

interface SubmitButtonProps {
  submitting: boolean
  label: string
  submittingLabel: string
  disabled?: boolean
}

export function SubmitButton({ submitting, label, submittingLabel, disabled }: SubmitButtonProps) {
  const isDisabled = submitting || !!disabled
  return (
    <Button
      type="submit"
      disabled={isDisabled}
      style={{ width: '100%', fontSize: 14.5, opacity: submitting ? 0.7 : 1, marginTop: 4 }}
    >
      {submitting ? submittingLabel : label}
    </Button>
  )
}
