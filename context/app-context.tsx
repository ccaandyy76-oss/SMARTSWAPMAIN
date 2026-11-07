'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import {
  mockUser,
  mockMerchants,
  mockTransactions,
  mockReviews,
  generateOTP,
  type User,
  type Merchant,
  type Transaction,
  type Review,
  type ShopApplication,
} from '@/lib/mock-data'
import { type AuthRole, type AuthTokenPayload, parseAuthToken } from '@/lib/auth-token'
import {
  clearAuthTokenOnDevice,
  ensureDemoAccounts,
  findAccount,
  findAccountById,
  getAuthToken,
  channelForNormalizedContact,
  setAuthTokenOnDevice,
} from '@/lib/auth-storage'
import type { Account } from '@/lib/auth-storage'

interface AppState {
  // Auth state
  isAuthenticated: boolean
  authReady: boolean
  userRole: 'user' | 'merchant' | 'admin' | null
  currentUser: User | null
  currentMerchant: Merchant | null
  /** User with approved shop acting as merchant without changing JWT role */
  merchantPersonaActive: boolean

  // Data
  merchants: Merchant[]
  transactions: Transaction[]
  reviews: Review[]

  // UI state
  activeTransaction: Transaction | null
}

interface AppContextType extends AppState {
  // Auth actions
  login: (
    role: AuthRole,
    opts?: {
      fullName?: string
      contact?: string
      businessName?: string
      accountId?: string
      kycStatus?: import('@/lib/kyc-types').UserKycStatus
      kycSkipped?: boolean
    }
  ) => void
  logout: () => void
  refreshUserFromStorage: () => void
  setUserTwoFactor: (enabled: boolean) => void
  setUserProfilePhoto: (url: string | undefined) => void
  
  // Transaction actions
  createTransaction: (
    type: 'cash-to-online' | 'online-to-cash',
    amount: number,
    merchantId: string
  ) => Promise<Transaction>
  updateTransaction: (transactionId: string, patch: Partial<Transaction>) => void
  acceptTransaction: (transactionId: string) => void
  rejectTransaction: (transactionId: string) => void
  completeTransaction: (transactionId: string) => void
  cancelTransaction: (transactionId: string) => void
  rateTransaction: (transactionId: string, rating: number, review?: string) => void
  setActiveTransaction: (transaction: Transaction | null) => void
  userGenerateOtp: (transactionId: string) => void
  merchantVerifyOtp: (transactionId: string, code: string) => boolean
  markPaymentDone: (transactionId: string) => void
  confirmTransactionUser: (transactionId: string) => void
  confirmTransactionMerchant: (transactionId: string) => void
  flagTransactionDisputed: (transactionId: string) => void

  // Merchant actions
  toggleMerchantOnline: () => void
  updateMerchantBalance: (type: 'cash' | 'online', amount: number) => void
  enterMerchantPersona: () => void
  exitMerchantPersona: () => void

  // Shop (user)
  submitShopApplication: (data: Omit<ShopApplication, 'id' | 'status' | 'submittedAt' | 'linkedMerchantId'>) => void
  approveShopApplication: () => void
  rejectShopApplication: (reason: string) => void

  // Admin actions
  approveMerchant: (merchantId: string) => void
  rejectMerchant: (merchantId: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function accountToUserPatch(account: Account): Partial<User> {
  const patch: Partial<User> = {
    accountId: account.id,
    name: account.fullName,
    kycStatus: account.kycStatus,
    kyc: account.kyc,
    kycSkipped: account.kycSkipped,
    referralCode: account.referralCode,
    referralsCount: account.referralsCount,
    referralRewards: account.referralRewards,
    verified: account.kycStatus === 'verified',
  }
  if (account.phone) patch.phone = `+91 ${account.phone}`
  if (account.email) patch.email = account.email
  return patch
}

function resolveAccountFromToken(parsed: AuthTokenPayload): Account | null {
  if (parsed.accountId) {
    const byId = findAccountById(parsed.accountId)
    if (byId) return byId
  }
  if (parsed.contact) {
    const ch = channelForNormalizedContact(parsed.contact)
    return findAccount(ch, parsed.contact)
  }
  return null
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    authReady: false,
    userRole: null,
    currentUser: null,
    currentMerchant: null,
    merchantPersonaActive: false,
    merchants: mockMerchants,
    transactions: mockTransactions,
    reviews: mockReviews,
    activeTransaction: null,
  })

  const applyRoleToState = useCallback((role: AuthRole, token?: AuthTokenPayload) => {
    const fullName = token?.fullName
    const account = token ? resolveAccountFromToken(token) : null
    const userPatch =
      account && (role === 'user' || role === 'admin') ? accountToUserPatch(account) : {}

    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      merchantPersonaActive: false,
      userRole: role,
      currentUser:
        role === 'user' || role === 'admin'
          ? {
              ...mockUser,
              ...userPatch,
              name: account?.fullName ?? (fullName ? fullName : mockUser.name),
            }
          : null,
      currentMerchant:
        role === 'merchant'
          ? {
              ...mockMerchants[0],
              ownerName: fullName ? fullName : mockMerchants[0].ownerName,
            }
          : null,
    }))
  }, [])

  useEffect(() => {
    ensureDemoAccounts()
    const token = getAuthToken()
    const parsed = parseAuthToken(token)

    if (parsed?.role) {
      applyRoleToState(parsed.role, parsed)
    }

    setState(prev => ({ ...prev, authReady: true }))
  }, [applyRoleToState])

  const login = useCallback(
    (
      role: AuthRole,
      opts?: {
        fullName?: string
        contact?: string
        businessName?: string
        accountId?: string
        kycStatus?: import('@/lib/kyc-types').UserKycStatus
        kycSkipped?: boolean
      }
    ) => {
      setAuthTokenOnDevice({
        role,
        fullName: opts?.fullName,
        contact: opts?.contact,
        accountId: opts?.accountId,
        kycStatus: opts?.kycStatus,
        kycSkipped: opts?.kycSkipped,
      })

      const account =
        opts?.contact != null
          ? findAccount(channelForNormalizedContact(opts.contact), opts.contact)
          : opts?.accountId
            ? findAccountById(opts.accountId)
            : null
      const userExtra =
        account && (role === 'user' || role === 'admin') ? accountToUserPatch(account) : {}

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        authReady: true,
        merchantPersonaActive: false,
        userRole: role,
        currentUser:
          role === 'user' || role === 'admin'
            ? {
                ...mockUser,
                ...userExtra,
                name: account?.fullName ?? (opts?.fullName ? opts.fullName : mockUser.name),
              }
            : null,
        currentMerchant:
          role === 'merchant'
            ? {
                ...mockMerchants[0],
                ownerName: opts?.fullName ? opts.fullName : mockMerchants[0].ownerName,
                businessName: opts?.businessName ? opts.businessName : mockMerchants[0].businessName,
              }
            : null,
      }))
    },
    []
  )

  const refreshUserFromStorage = useCallback(() => {
    const token = getAuthToken()
    const parsed = parseAuthToken(token)
    if (!parsed?.role) return
    applyRoleToState(parsed.role, parsed)
  }, [applyRoleToState])

  const setUserTwoFactor = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, twoFactorEnabled: enabled } : null,
    }))
  }, [])

  const setUserProfilePhoto = useCallback((url: string | undefined) => {
    setState((prev) => ({
      ...prev,
      currentUser: prev.currentUser
        ? { ...prev.currentUser, profilePhotoUrl: url, avatar: url }
        : null,
    }))
  }, [])

  const logout = useCallback(() => {
    clearAuthTokenOnDevice()
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      authReady: true,
      userRole: null,
      currentUser: null,
      currentMerchant: null,
      merchantPersonaActive: false,
      activeTransaction: null,
    }))
  }, [])

  const updateTransaction = useCallback((transactionId: string, patch: Partial<Transaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t =>
        t.id === transactionId ? { ...t, ...patch } : t
      ),
      activeTransaction:
        prev.activeTransaction?.id === transactionId
          ? { ...prev.activeTransaction, ...patch }
          : prev.activeTransaction,
    }))
  }, [])

  const createTransaction = useCallback(
    async (
      type: 'cash-to-online' | 'online-to-cash',
      amount: number,
      merchantId: string
    ): Promise<Transaction> => {
      const merchant = state.merchants.find(m => m.id === merchantId)
      const rate = merchant?.commissionRate ?? 1.5
      let commission = Math.round(amount * (rate / 100) * 100) / 100
      let amountGiven = amount
      let amountReceived = amount
      let usedApi = false

      try {
        const res = await fetch('/api/exchange/commission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            exchangeType: type,
            commissionRatePercent: rate,
          }),
        })
        if (res.ok) {
          const data = (await res.json()) as {
            commission: number
            amountGiven: number
            amountReceived: number
          }
          commission = data.commission
          amountGiven = data.amountGiven
          amountReceived = data.amountReceived
          usedApi = true
        }
      } catch {
        // fallback below
      }

      if (!usedApi) {
        commission = Math.round(amount * (rate / 100) * 100) / 100
        if (type === 'cash-to-online') {
          amountGiven = amount
          amountReceived = Math.round((amount - commission) * 100) / 100
        } else {
          amountReceived = amount
          amountGiven = Math.round((amount + commission) * 100) / 100
        }
      }

      const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        type,
        amount,
        commission,
        amountGiven,
        amountReceived,
        status: 'pending',
        userId: state.currentUser?.id || 'user-1',
        userName: state.currentUser?.name || 'Guest User',
        merchantId,
        merchantName: merchant?.businessName || 'Unknown Merchant',
        shopId: merchantId,
        createdAt: new Date().toISOString(),
      }

      setState(prev => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
      }))

      return newTransaction
    },
    [state.merchants, state.currentUser]
  )

  const acceptTransaction = useCallback(
    (transactionId: string) => {
      updateTransaction(transactionId, { status: 'accepted' })
    },
    [updateTransaction]
  )

  const rejectTransaction = useCallback((transactionId: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t =>
        t.id === transactionId ? { ...t, status: 'cancelled' } : t
      ),
    }))
  }, [])

  const completeTransaction = useCallback((transactionId: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t =>
        t.id === transactionId 
          ? { ...t, status: 'completed', completedAt: new Date().toISOString() } 
          : t
      ),
      activeTransaction: null,
    }))
  }, [])

  const cancelTransaction = useCallback((transactionId: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t =>
        t.id === transactionId ? { ...t, status: 'cancelled' } : t
      ),
      activeTransaction: null,
    }))
  }, [])

  const rateTransaction = useCallback((transactionId: string, rating: number, review?: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t =>
        t.id === transactionId ? { ...t, rating, review } : t
      ),
    }))
  }, [])

  const setActiveTransaction = useCallback((transaction: Transaction | null) => {
    setState(prev => ({
      ...prev,
      activeTransaction: transaction,
    }))
  }, [])

  const userGenerateOtp = useCallback(
    (transactionId: string) => {
      const otp = generateOTP()
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
      updateTransaction(transactionId, { otp, otpExpiresAt })
    },
    [updateTransaction]
  )

  const merchantVerifyOtp = useCallback(
    (transactionId: string, code: string): boolean => {
      let ok = false
      setState(prev => {
        const t = prev.transactions.find(x => x.id === transactionId)
        if (t?.status === 'otp_verified') {
          ok = true
          return prev
        }
        if (!t?.otp || t.otp !== code.trim()) {
          return prev
        }
        ok = true
        const updated: Transaction = {
          ...t,
          status: 'otp_verified',
          otpVerifiedAt: new Date().toISOString(),
        }
        return {
          ...prev,
          transactions: prev.transactions.map(x => (x.id === transactionId ? updated : x)),
          activeTransaction:
            prev.activeTransaction?.id === transactionId ? updated : prev.activeTransaction,
        }
      })
      return ok
    },
    []
  )

  const markPaymentDone = useCallback(
    (transactionId: string) => {
      setState((prev) => {
        const t = prev.transactions.find((x) => x.id === transactionId)
        if (t?.status === 'payment_done' || t?.status === 'completed') return prev
        if (t && t.status !== 'otp_verified') return prev
        return {
          ...prev,
          transactions: prev.transactions.map((x) =>
            x.id === transactionId ? { ...x, status: 'payment_done' as const } : x
          ),
          activeTransaction:
            prev.activeTransaction?.id === transactionId
              ? { ...prev.activeTransaction, status: 'payment_done' as const }
              : prev.activeTransaction,
        }
      })
    },
    []
  )

  const confirmTransactionUser = useCallback((transactionId: string) => {
    setState(prev => {
      const t = prev.transactions.find(x => x.id === transactionId)
      if (!t) return prev
      const next: Transaction = { ...t, userConfirmed: true }
      if (
        next.userConfirmed &&
        next.merchantConfirmed &&
        next.status === 'payment_done'
      ) {
        const completed: Transaction = {
          ...next,
          status: 'completed',
          completedAt: new Date().toISOString(),
        }
        return {
          ...prev,
          transactions: prev.transactions.map(x => (x.id === transactionId ? completed : x)),
          activeTransaction: null,
          currentUser: prev.currentUser
            ? {
                ...prev.currentUser,
                totalExchanges: prev.currentUser.totalExchanges + 1,
                totalAmount:
                  prev.currentUser.totalAmount +
                  (t.amountReceived ?? t.amount),
              }
            : null,
        }
      }
      return {
        ...prev,
        transactions: prev.transactions.map(x => (x.id === transactionId ? next : x)),
        activeTransaction:
          prev.activeTransaction?.id === transactionId ? next : prev.activeTransaction,
      }
    })
  }, [])

  const confirmTransactionMerchant = useCallback((transactionId: string) => {
    setState(prev => {
      const t = prev.transactions.find(x => x.id === transactionId)
      if (!t) return prev
      const next: Transaction = { ...t, merchantConfirmed: true }
      if (
        next.userConfirmed &&
        next.merchantConfirmed &&
        next.status === 'payment_done'
      ) {
        const completed: Transaction = {
          ...next,
          status: 'completed',
          completedAt: new Date().toISOString(),
        }
        return {
          ...prev,
          transactions: prev.transactions.map(x => (x.id === transactionId ? completed : x)),
          activeTransaction: null,
          currentUser: prev.currentUser
            ? {
                ...prev.currentUser,
                totalExchanges: prev.currentUser.totalExchanges + 1,
                totalAmount:
                  prev.currentUser.totalAmount +
                  (t.amountReceived ?? t.amount),
              }
            : null,
        }
      }
      return {
        ...prev,
        transactions: prev.transactions.map(x => (x.id === transactionId ? next : x)),
        activeTransaction:
          prev.activeTransaction?.id === transactionId ? next : prev.activeTransaction,
      }
    })
  }, [])

  const flagTransactionDisputed = useCallback(
    (transactionId: string) => {
      updateTransaction(transactionId, { status: 'disputed' })
    },
    [updateTransaction]
  )

  const enterMerchantPersona = useCallback(() => {
    setState(prev => {
      if (prev.currentUser?.shopApplication?.status !== 'approved') return prev
      const mid = prev.currentUser.shopApplication?.linkedMerchantId
      if (!mid) return prev
      const m = prev.merchants.find(x => x.id === mid)
      if (!m) return prev
      return { ...prev, merchantPersonaActive: true, currentMerchant: m }
    })
  }, [])

  const exitMerchantPersona = useCallback(() => {
    setState(prev => ({
      ...prev,
      merchantPersonaActive: false,
      currentMerchant: prev.userRole === 'merchant' ? prev.currentMerchant : null,
    }))
  }, [])

  const submitShopApplication = useCallback(
    (data: Omit<ShopApplication, 'id' | 'status' | 'submittedAt' | 'linkedMerchantId'>) => {
      const id = `shop-${Date.now()}`
      const app: ShopApplication = {
        ...data,
        id,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      }
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser ? { ...prev.currentUser, shopApplication: app } : null,
      }))
    },
    []
  )

  const approveShopApplication = useCallback(() => {
    setState(prev => {
      const app = prev.currentUser?.shopApplication
      if (!app || app.status !== 'pending') return prev
      const linkedMerchantId = `merchant-shop-${app.id}`
      const newMerchant: Merchant = {
        id: linkedMerchantId,
        businessName: app.basic.businessName,
        ownerName: app.owner.fullName,
        phone: app.contact.phone,
        email: app.contact.email,
        address: `${app.location.line1}, ${app.location.city}, ${app.location.state} ${app.location.pinCode}`,
        latitude: app.location.latitude,
        longitude: app.location.longitude,
        rating: 5,
        totalRatings: 0,
        cashBalance: 50000,
        onlineBalance: 50000,
        isTrusted: false,
        isOnline: true,
        commissionRate: app.financial.commissionCashToOnline,
        kycStatus: 'approved',
        totalEarnings: 0,
        memberSince: new Date().toISOString().slice(0, 10),
      }
      const updatedApp: ShopApplication = { ...app, status: 'approved', linkedMerchantId }
      return {
        ...prev,
        merchants: [...prev.merchants, newMerchant],
        currentUser: prev.currentUser
          ? { ...prev.currentUser, shopApplication: updatedApp }
          : null,
      }
    })
  }, [])

  const rejectShopApplication = useCallback((reason: string) => {
    setState(prev => {
      const app = prev.currentUser?.shopApplication
      if (!app || app.status !== 'pending') return prev
      const updatedApp: ShopApplication = {
        ...app,
        status: 'rejected',
        rejectionReason: reason,
      }
      return {
        ...prev,
        currentUser: prev.currentUser
          ? { ...prev.currentUser, shopApplication: updatedApp }
          : null,
      }
    })
  }, [])

  const toggleMerchantOnline = useCallback(() => {
    if (!state.currentMerchant) return

    setState(prev => ({
      ...prev,
      currentMerchant: prev.currentMerchant 
        ? { ...prev.currentMerchant, isOnline: !prev.currentMerchant.isOnline }
        : null,
      merchants: prev.merchants.map(m =>
        m.id === prev.currentMerchant?.id ? { ...m, isOnline: !m.isOnline } : m
      ),
    }))
  }, [state.currentMerchant])

  const updateMerchantBalance = useCallback((type: 'cash' | 'online', amount: number) => {
    if (!state.currentMerchant) return
    
    setState(prev => ({
      ...prev,
      currentMerchant: prev.currentMerchant
        ? {
            ...prev.currentMerchant,
            [type === 'cash' ? 'cashBalance' : 'onlineBalance']: amount,
          }
        : null,
      merchants: prev.merchants.map(m =>
        m.id === prev.currentMerchant?.id
          ? { ...m, [type === 'cash' ? 'cashBalance' : 'onlineBalance']: amount }
          : m
      ),
    }))
  }, [state.currentMerchant])

  const approveMerchant = useCallback((merchantId: string) => {
    setState(prev => ({
      ...prev,
      merchants: prev.merchants.map(m =>
        m.id === merchantId ? { ...m, kycStatus: 'approved' } : m
      ),
    }))
  }, [])

  const rejectMerchant = useCallback((merchantId: string) => {
    setState(prev => ({
      ...prev,
      merchants: prev.merchants.map(m =>
        m.id === merchantId ? { ...m, kycStatus: 'rejected' } : m
      ),
    }))
  }, [])

  const value: AppContextType = {
    ...state,
    login,
    logout,
    refreshUserFromStorage,
    setUserTwoFactor,
    setUserProfilePhoto,
    createTransaction,
    updateTransaction,
    acceptTransaction,
    rejectTransaction,
    completeTransaction,
    cancelTransaction,
    rateTransaction,
    setActiveTransaction,
    userGenerateOtp,
    merchantVerifyOtp,
    markPaymentDone,
    confirmTransactionUser,
    confirmTransactionMerchant,
    flagTransactionDisputed,
    toggleMerchantOnline,
    updateMerchantBalance,
    enterMerchantPersona,
    exitMerchantPersona,
    submitShopApplication,
    approveShopApplication,
    rejectShopApplication,
    approveMerchant,
    rejectMerchant,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
