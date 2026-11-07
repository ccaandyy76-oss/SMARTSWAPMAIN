/** 12 digits, Verhoeff checksum optional — length + numeric only for demo. */
export function isValidAadhaarNumber(raw: string): boolean {
  const d = raw.replace(/\s/g, '')
  if (!/^\d{12}$/.test(d)) return false
  return true
}

export function isValidPanNumber(raw: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(raw.trim().toUpperCase())
}

export function normalizePan(raw: string): string {
  return raw.trim().toUpperCase()
}
