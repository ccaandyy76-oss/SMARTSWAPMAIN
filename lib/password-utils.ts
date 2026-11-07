export interface PasswordValidationResult {
  ok: boolean
  criteria: {
    min8: boolean
    uppercase: boolean
    number: boolean
    special: boolean
  }
}

export function validatePassword(password: string): PasswordValidationResult {
  const min8 = password.length >= 8
  const uppercase = /[A-Z]/.test(password)
  const number = /[0-9]/.test(password)
  const special = /[^A-Za-z0-9]/.test(password)

  const criteria = { min8, uppercase, number, special }
  const ok = Object.values(criteria).every(Boolean)
  return { ok, criteria }
}

export function getPasswordStrength(password: string): {
  score: number
  label: 'Weak' | 'Fair' | 'Good' | 'Strong'
  percent: number
} {
  const v = validatePassword(password)
  const score = [
    v.criteria.min8,
    v.criteria.uppercase,
    v.criteria.number,
    v.criteria.special,
  ].filter(Boolean).length

  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong'
  const percent = (score / 4) * 100

  return { score, label, percent }
}

