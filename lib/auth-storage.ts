import {
  isValidEmail,
  isValidIndianMobile,
  normalizeEmail,
  normalizeIndianPhone,
} from '@/lib/auth-contact'
import { mockMerchants, mockUser } from '@/lib/mock-data'
import { type AuthRole, createAuthToken } from '@/lib/auth-token'
import { validatePassword } from '@/lib/password-utils'
import type { KycRecord, UserKycStatus } from '@/lib/kyc-types'

export type VerificationChannel = 'email' | 'phone'

export interface Account {
  id: string
  role: AuthRole
  fullName: string
  phone?: string // normalized 10 digits (no +91)
  email?: string // normalized lowercase
  password: string
  createdAt: number
  kycStatus: UserKycStatus
  kyc?: KycRecord | null
  kycSkipped?: boolean
  referralCode: string
  referralsCount: number
  referralRewards: number
}

interface OtpChallenge {
  channel: VerificationChannel
  contact: string
  otp: string
  expiresAt: number
  createdAt: number
}

const ACCOUNTS_KEY = 'smartswap_accounts_v1'
const OTP_KEY = 'smartswap_otp_challenge_v1'
const AUTH_TOKEN_KEY = 'smartswap_auth_token_v1'

function readJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function getAccounts(): Account[] {
  return readJson<Account[]>(ACCOUNTS_KEY, [])
}

function setAccounts(accounts: Account[]) {
  writeJson(ACCOUNTS_KEY, accounts)
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = 'SW-'
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

function migrateAccountShape(a: Account): Account {
  return {
    ...a,
    kycStatus: a.kycStatus ?? 'not_started',
    kyc: a.kyc ?? null,
    kycSkipped: a.kycSkipped ?? false,
    referralCode: a.referralCode ?? generateReferralCode(),
    referralsCount: a.referralsCount ?? 0,
    referralRewards: a.referralRewards ?? 0,
  }
}

function getAccountsMigrated(): Account[] {
  return getAccounts().map(migrateAccountShape)
}

function setAccountsMigrated(accounts: Account[]) {
  setAccounts(accounts.map(migrateAccountShape))
}

export function persistAccountPatch(accountId: string, patch: Partial<Account>) {
  const accounts = getAccountsMigrated()
  const idx = accounts.findIndex((a) => a.id === accountId)
  if (idx < 0) throw new Error('Account not found')
  accounts[idx] = migrateAccountShape({ ...accounts[idx], ...patch })
  setAccountsMigrated(accounts)
  return accounts[idx]
}

export function skipKycForAccount(accountId: string) {
  const updated = persistAccountPatch(accountId, {
    kycSkipped: true,
    kycStatus: 'not_started',
  })
  syncAuthTokenWithAccount(updated)
  return updated
}

export function applyKycVerified(accountId: string, kyc: KycRecord) {
  const updated = persistAccountPatch(accountId, {
    kycStatus: 'verified',
    kyc,
    kycSkipped: false,
  })
  syncAuthTokenWithAccount(updated)
  return updated
}

export function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthTokenOnDevice(payload: {
  role: AuthRole
  fullName?: string
  contact?: string
  accountId?: string
  kycStatus?: UserKycStatus
  kycSkipped?: boolean
}) {
  const token = createAuthToken({
    role: payload.role,
    fullName: payload.fullName,
    contact: payload.contact,
    accountId: payload.accountId,
    kycStatus: payload.kycStatus,
    kycSkipped: payload.kycSkipped,
    iat: Date.now(),
  })
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  return token
}

/** Infer channel from normalized contact string */
export function channelForNormalizedContact(contact: string): VerificationChannel {
  return contact.includes('@') ? 'email' : 'phone'
}

export function findAccountById(id: string): Account | null {
  const accounts = getAccountsMigrated()
  return accounts.find((a) => a.id === id) || null
}

/** Refresh JWT-like token fields from persisted account (e.g. after KYC). */
export function syncAuthTokenWithAccount(account: Account) {
  const contact = account.email ?? account.phone
  if (!contact) return
  setAuthTokenOnDevice({
    role: account.role,
    fullName: account.fullName,
    contact,
    accountId: account.id,
    kycStatus: account.kycStatus,
    kycSkipped: account.kycSkipped,
  })
}

export function clearAuthTokenOnDevice() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function normalizeContact(
  channel: VerificationChannel,
  raw: string
): string | null {
  if (channel === 'phone') {
    const phone = normalizeIndianPhone(raw)
    if (!isValidIndianMobile(phone)) return null
    return phone
  }

  const email = normalizeEmail(raw)
  if (!isValidEmail(email)) return null
  return email
}

function getContactLabel(channel: VerificationChannel, contact: string): string {
  if (channel === 'phone') return `+91 ${contact}`
  return contact
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function sendOtpChallenge(
  channel: VerificationChannel,
  contact: string
): { otpForDemo: string } {
  const otp = generateOtp()
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

  const challenge: OtpChallenge = {
    channel,
    contact,
    otp,
    expiresAt,
    createdAt: Date.now(),
  }

  writeJson(OTP_KEY, challenge)

  return { otpForDemo: otp }
}

export function verifyOtpChallenge(
  channel: VerificationChannel,
  contact: string,
  otp: string
): { ok: boolean; reason?: 'expired' | 'invalid' } {
  const raw = readJson<OtpChallenge | null>(OTP_KEY, null)
  if (!raw) return { ok: false, reason: 'invalid' }
  if (raw.channel !== channel || raw.contact !== contact)
    return { ok: false, reason: 'invalid' }
  if (Date.now() > raw.expiresAt) return { ok: false, reason: 'expired' }
  if (raw.otp !== otp) return { ok: false, reason: 'invalid' }

  // One-time usage
  writeJson(OTP_KEY, null)
  return { ok: true }
}

export function findAccount(
  channel: VerificationChannel,
  contact: string
): Account | null {
  const accounts = getAccountsMigrated()
  return (
    accounts.find((a) => {
      if (channel === 'phone') return a.phone === contact
      return a.email === contact
    }) || null
  )
}

export function registerAccount(params: {
  role: AuthRole
  fullName: string
  channel: VerificationChannel
  contact: string
  password: string
}): { account: Account } {
  const { role, fullName, channel, contact, password } = params

  const pw = validatePassword(password)
  if (!pw.ok) throw new Error('Invalid password format')

  const accounts = getAccountsMigrated()
  const already = accounts.some((a) =>
    channel === 'phone' ? a.phone === contact : a.email === contact
  )
  if (already) throw new Error('Account already exists')

  const newAccount = migrateAccountShape({
    id: `acc-${Date.now()}`,
    role,
    fullName,
    createdAt: Date.now(),
    password,
    kycStatus: 'not_started',
    kyc: null,
    kycSkipped: false,
    referralCode: generateReferralCode(),
    referralsCount: 0,
    referralRewards: 0,
    ...(channel === 'phone' ? { phone: contact } : { email: contact }),
  } as Account)

  setAccountsMigrated([newAccount, ...accounts])
  return { account: newAccount }
}

export function updatePassword(params: {
  role?: AuthRole
  channel: VerificationChannel
  contact: string
  newPassword: string
}): { ok: boolean } {
  const { channel, contact, newPassword } = params
  const pw = validatePassword(newPassword)
  if (!pw.ok) throw new Error('Invalid password format')

  const accounts = getAccountsMigrated()
  const idx = accounts.findIndex((a) =>
    channel === 'phone' ? a.phone === contact : a.email === contact
  )
  if (idx < 0) return { ok: false }

  accounts[idx] = migrateAccountShape({ ...accounts[idx], password: newPassword })
  setAccountsMigrated(accounts)
  return { ok: true }
}

export function formatContactForMessage(
  channel: VerificationChannel,
  contact: string
): string {
  return getContactLabel(channel, contact)
}

export function ensureDemoAccounts() {
  if (typeof localStorage === 'undefined') return
  const accounts = readJson<Account[]>(ACCOUNTS_KEY, [])
  if (accounts.length > 0) return

  const userEmail = mockUser.email ? normalizeEmail(mockUser.email) : null
  const userPhone = mockUser.phone ? normalizeIndianPhone(mockUser.phone) : null

  const merchantEmail = mockMerchants[0]?.email ? normalizeEmail(mockMerchants[0].email) : null
  const merchantPhone = mockMerchants[0]?.phone ? normalizeIndianPhone(mockMerchants[0].phone) : null

  const demoUserPassword = 'User@1234!'
  const demoMerchantPassword = 'Merchant@1234!'
  const demoAdminPassword = 'Admin@1234!'

  const now = Date.now()
  const userKycVerified = {
    kycStatus: 'verified' as const,
    kyc: {
      documentType: 'pan' as const,
      verifiedAt: now,
      displayLabel: 'PAN Card',
      maskedRef: 'XXXXXX123X',
    },
    kycSkipped: false,
    referralCode: 'SW-DEMO01',
    referralsCount: 3,
    referralRewards: 150,
  }

  const seeded: Account[] = []

  if (userEmail && isValidEmail(userEmail)) {
    seeded.push({
      id: 'demo-user-email',
      role: 'user',
      fullName: mockUser.name,
      email: userEmail,
      password: demoUserPassword,
      createdAt: now,
      ...userKycVerified,
    })
  }

  if (userPhone && isValidIndianMobile(userPhone)) {
    seeded.push({
      id: 'demo-user-phone',
      role: 'user',
      fullName: mockUser.name,
      phone: userPhone,
      password: demoUserPassword,
      createdAt: now,
      ...userKycVerified,
    })
  }

  if (merchantEmail && isValidEmail(merchantEmail)) {
    seeded.push({
      id: 'demo-merchant-email',
      role: 'merchant',
      fullName: mockMerchants[0].ownerName,
      email: merchantEmail,
      password: demoMerchantPassword,
      createdAt: now,
      kycStatus: 'verified',
      kyc: null,
      kycSkipped: false,
      referralCode: generateReferralCode(),
      referralsCount: 0,
      referralRewards: 0,
    })
  }

  if (merchantPhone && isValidIndianMobile(merchantPhone)) {
    seeded.push({
      id: 'demo-merchant-phone',
      role: 'merchant',
      fullName: mockMerchants[0].ownerName,
      phone: merchantPhone,
      password: demoMerchantPassword,
      createdAt: now,
      kycStatus: 'verified',
      kyc: null,
      kycSkipped: false,
      referralCode: generateReferralCode(),
      referralsCount: 0,
      referralRewards: 0,
    })
  }

  seeded.push({
    id: 'demo-admin-email',
    role: 'admin',
    fullName: 'Admin',
    email: 'admin@smartswap.com',
    password: demoAdminPassword,
    createdAt: now,
    kycStatus: 'verified',
    kyc: null,
    kycSkipped: false,
    referralCode: generateReferralCode(),
    referralsCount: 0,
    referralRewards: 0,
  })

  seeded.push({
    id: 'demo-admin-phone',
    role: 'admin',
    fullName: 'Admin',
    phone: '9000000000',
    password: demoAdminPassword,
    createdAt: now,
    kycStatus: 'verified',
    kyc: null,
    kycSkipped: false,
    referralCode: generateReferralCode(),
    referralsCount: 0,
    referralRewards: 0,
  })

  writeJson(ACCOUNTS_KEY, seeded.map(migrateAccountShape))
}

