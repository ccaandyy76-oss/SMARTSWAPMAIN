/** Indian mobile: 10 digits (client may include country code; normalize strips to last 10). */
export function normalizeIndianPhone(input: string): string {
  return input.replace(/\D/g, '').slice(-10)
}

export function isValidIndianMobile(digits: string): boolean {
  return /^\d{10}$/.test(digits)
}

export function isValidEmail(email: string): boolean {
  const t = email.trim()
  if (t.length < 3 || t.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
