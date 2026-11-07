import type { UserKycStatus } from '@/lib/kyc-types'

export type AuthRole = 'user' | 'merchant' | 'admin'

export interface AuthTokenPayload {
  role: AuthRole
  contact?: string
  fullName?: string
  accountId?: string
  kycStatus?: UserKycStatus
  kycSkipped?: boolean
  iat: number
}

function base64UrlEncode(input: string): string {
  const b =
    typeof btoa !== 'undefined'
      ? btoa(unescape(encodeURIComponent(input)))
      : Buffer.from(input, 'utf8').toString('base64')

  return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad =
    normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))

  if (typeof atob !== 'undefined') {
    const decoded = atob(normalized + pad)
    return decodeURIComponent(escape(decoded))
  }

  return Buffer.from(normalized + pad, 'base64').toString('utf8')
}

export function createAuthToken(payload: AuthTokenPayload): string {
  const header = { alg: 'none', typ: 'JWT' }
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  // Mock JWT: no signature. Role is still persisted in a token-like string.
  return `${headerB64}.${payloadB64}.`
}

export function parseAuthToken(
  token: string | null | undefined
): AuthTokenPayload | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const payloadStr = base64UrlDecode(parts[1])
    const parsed = JSON.parse(payloadStr) as Partial<AuthTokenPayload>
    if (
      !parsed ||
      (parsed.role !== 'user' && parsed.role !== 'merchant' && parsed.role !== 'admin')
    )
      return null
    if (typeof parsed.iat !== 'number') return null
    const kycStatus = parsed.kycStatus
    if (
      kycStatus != null &&
      kycStatus !== 'not_started' &&
      kycStatus !== 'pending' &&
      kycStatus !== 'verified' &&
      kycStatus !== 'failed'
    )
      return null
    if (parsed.kycSkipped !== undefined && typeof parsed.kycSkipped !== 'boolean') return null
    return parsed as AuthTokenPayload
  } catch {
    return null
  }
}

