import { RuleStatusIcon } from './icons'
import { PASSWORD_RULES } from './passwordRules'

export function PasswordStrengthChecklist({ password }: { password: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password)
        return (
          <div
            key={rule.label}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: met ? 'var(--pos)' : 'var(--muted)' }}
          >
            <RuleStatusIcon met={met} />
            <span>{rule.label}</span>
          </div>
        )
      })}
    </div>
  )
}
