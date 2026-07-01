import { describe, expect, it } from 'vitest'
import { isPasswordStrong, PASSWORD_RULES } from './passwordRules'

describe('PASSWORD_RULES individual rules', () => {
  it('requires at least 8 characters', () => {
    const rule = PASSWORD_RULES.find((r) => r.label.includes('8'))!
    expect(rule.test('1234567')).toBe(false)
    expect(rule.test('12345678')).toBe(true)
  })

  it('requires an uppercase letter', () => {
    const rule = PASSWORD_RULES.find((r) => r.label.toLowerCase().includes('mayúscula'))!
    expect(rule.test('password')).toBe(false)
    expect(rule.test('Password')).toBe(true)
  })

  it('requires a lowercase letter', () => {
    const rule = PASSWORD_RULES.find((r) => r.label.toLowerCase().includes('minúscula'))!
    expect(rule.test('PASSWORD')).toBe(false)
    expect(rule.test('pASSWORD')).toBe(true)
  })

  it('requires a digit', () => {
    const rule = PASSWORD_RULES.find((r) => r.label.toLowerCase().includes('número'))!
    expect(rule.test('Password!')).toBe(false)
    expect(rule.test('Password1!')).toBe(true)
  })

  it('requires a special character', () => {
    const rule = PASSWORD_RULES.find((r) => r.label.includes('!'))!
    expect(rule.test('Password1')).toBe(false)
    expect(rule.test('Password1!')).toBe(true)
  })
})

describe('isPasswordStrong', () => {
  it('returns true when all rules pass', () => {
    expect(isPasswordStrong('Secure1!')).toBe(true)
  })

  it('returns false when any rule fails', () => {
    expect(isPasswordStrong('weak')).toBe(false)
    expect(isPasswordStrong('NoSpecial1')).toBe(false)
  })
})
