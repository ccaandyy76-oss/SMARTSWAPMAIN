import type { KycRecord, UserKycStatus } from '@/lib/kyc-types'

export type TransactionStatus =
  | 'pending'
  | 'accepted'
  | 'in-progress'
  | 'otp_verified'
  | 'payment_done'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export type ShopCategory =
  | 'money-exchange'
  | 'general-store'
  | 'grocery'
  | 'medical'
  | 'electronics'
  | 'other'

export type ShopApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface ShopApplication {
  id: string
  status: ShopApplicationStatus
  submittedAt: string
  rejectionReason?: string
  basic: {
    businessName: string
    category: ShopCategory
    description: string
    yearsInBusiness?: string
  }
  location: {
    line1: string
    line2?: string
    city: string
    state: string
    pinCode: string
    latitude: number
    longitude: number
  }
  contact: {
    phone: string
    email?: string
    whatsapp?: string
    openingTime: string
    closingTime: string
    workingDays: string[]
  }
  owner: {
    fullName: string
    aadhaar: string
    pan: string
    dateOfBirth: string
    shopPhotoDataUrl?: string
    ownerPhotoDataUrl?: string
  }
  financial: {
    bankAccount: string
    ifsc: string
    accountHolderName: string
    commissionCashToOnline: number
    commissionOnlineToCash: number
    maxExchange: number
    minExchange: number
  }
  linkedMerchantId?: string
}

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  verified: boolean
  totalExchanges: number
  totalAmount: number
  memberSince: string
  accountId?: string
  shopApplication?: ShopApplication | null
  kycStatus?: UserKycStatus
  kyc?: KycRecord | null
  kycSkipped?: boolean
  referralCode?: string
  referralsCount?: number
  referralRewards?: number
  twoFactorEnabled?: boolean
  activeSessions?: { id: string; label: string; current: boolean }[]
  profilePhotoUrl?: string
}

export interface Merchant {
  id: string
  businessName: string
  ownerName: string
  phone: string
  email?: string
  address: string
  latitude: number
  longitude: number
  rating: number
  totalRatings: number
  cashBalance: number
  onlineBalance: number
  isTrusted: boolean
  isOnline: boolean
  commissionRate: number
  kycStatus: 'pending' | 'approved' | 'rejected'
  kycDocuments?: string[]
  totalEarnings: number
  memberSince: string
}

export interface Transaction {
  id: string
  type: 'cash-to-online' | 'online-to-cash'
  amount: number
  commission: number
  status: TransactionStatus
  userId: string
  userName: string
  merchantId: string
  merchantName: string
  shopId?: string
  amountGiven?: number
  amountReceived?: number
  otp?: string
  otpExpiresAt?: string
  otpVerifiedAt?: string
  userConfirmed?: boolean
  merchantConfirmed?: boolean
  createdAt: string
  completedAt?: string
  rating?: number
  review?: string
}

export interface Review {
  id: string
  merchantId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export const mockUser: User = {
  id: 'user-1',
  name: 'Rahul Sharma',
  phone: '+91 98765 43210',
  email: 'rahul.sharma@email.com',
  verified: true,
  totalExchanges: 24,
  totalAmount: 125000,
  memberSince: '2024-06-15',
  twoFactorEnabled: false,
  activeSessions: [
    { id: 'sess-1', label: 'Chrome on Windows · Noida', current: true },
    { id: 'sess-2', label: 'Safari on iPhone', current: false },
  ],
}

export const mockMerchants: Merchant[] = [
  {
    id: 'merchant-1',
    businessName: 'Quick Cash Exchange',
    ownerName: 'Amit Kumar',
    phone: '+91 99887 76655',
    email: 'amit@quickcash.com',
    address: '123, MG Road, Sector 18, Noida',
    latitude: 28.5706,
    longitude: 77.3219,
    rating: 4.8,
    totalRatings: 156,
    cashBalance: 45000,
    onlineBalance: 38000,
    isTrusted: true,
    isOnline: true,
    commissionRate: 1.5,
    kycStatus: 'approved',
    totalEarnings: 12450,
    memberSince: '2024-01-10',
  },
  {
    id: 'merchant-2',
    businessName: 'Money Express Hub',
    ownerName: 'Priya Singh',
    phone: '+91 88776 65544',
    email: 'priya@moneyexpress.com',
    address: '45, Connaught Place, New Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    rating: 4.6,
    totalRatings: 89,
    cashBalance: 28000,
    onlineBalance: 52000,
    isTrusted: true,
    isOnline: true,
    commissionRate: 2.0,
    kycStatus: 'approved',
    totalEarnings: 8920,
    memberSince: '2024-02-22',
  },
  {
    id: 'merchant-3',
    businessName: 'Cash Point Services',
    ownerName: 'Vikram Patel',
    phone: '+91 77665 54433',
    email: 'vikram@cashpoint.com',
    address: '78, Linking Road, Bandra, Mumbai',
    latitude: 19.0596,
    longitude: 72.8295,
    rating: 4.9,
    totalRatings: 234,
    cashBalance: 62000,
    onlineBalance: 41000,
    isTrusted: true,
    isOnline: false,
    commissionRate: 1.8,
    kycStatus: 'approved',
    totalEarnings: 18750,
    memberSince: '2023-11-05',
  },
  {
    id: 'merchant-4',
    businessName: 'FastPay Corner',
    ownerName: 'Neha Gupta',
    phone: '+91 66554 43322',
    email: 'neha@fastpay.com',
    address: '12, Brigade Road, Bangalore',
    latitude: 12.9716,
    longitude: 77.5946,
    rating: 4.3,
    totalRatings: 45,
    cashBalance: 15000,
    onlineBalance: 22000,
    isTrusted: false,
    isOnline: true,
    commissionRate: 2.5,
    kycStatus: 'approved',
    totalEarnings: 3200,
    memberSince: '2024-04-18',
  },
  {
    id: 'merchant-5',
    businessName: 'Reliable Exchange',
    ownerName: 'Suresh Reddy',
    phone: '+91 55443 32211',
    email: 'suresh@reliable.com',
    address: '34, Jubilee Hills, Hyderabad',
    latitude: 17.4326,
    longitude: 78.4071,
    rating: 4.7,
    totalRatings: 112,
    cashBalance: 38000,
    onlineBalance: 29000,
    isTrusted: true,
    isOnline: true,
    commissionRate: 1.5,
    kycStatus: 'approved',
    totalEarnings: 9680,
    memberSince: '2024-03-01',
  },
]

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'cash-to-online',
    amount: 5000,
    commission: 75,
    status: 'completed',
    userId: 'user-1',
    userName: 'Rahul Sharma',
    merchantId: 'merchant-1',
    merchantName: 'Quick Cash Exchange',
    createdAt: '2024-12-20T10:30:00',
    completedAt: '2024-12-20T10:45:00',
    rating: 5,
    review: 'Very quick and professional service!',
  },
  {
    id: 'txn-2',
    type: 'online-to-cash',
    amount: 10000,
    commission: 200,
    status: 'completed',
    userId: 'user-1',
    userName: 'Rahul Sharma',
    merchantId: 'merchant-2',
    merchantName: 'Money Express Hub',
    createdAt: '2024-12-19T15:20:00',
    completedAt: '2024-12-19T15:35:00',
    rating: 4,
    review: 'Good service, bit slow.',
  },
  {
    id: 'txn-3',
    type: 'cash-to-online',
    amount: 15000,
    commission: 270,
    status: 'pending',
    userId: 'user-1',
    userName: 'Rahul Sharma',
    merchantId: 'merchant-3',
    merchantName: 'Cash Point Services',
    createdAt: '2024-12-21T09:00:00',
  },
  {
    id: 'txn-4',
    type: 'online-to-cash',
    amount: 8000,
    commission: 200,
    status: 'in-progress',
    userId: 'user-1',
    userName: 'Rahul Sharma',
    merchantId: 'merchant-5',
    merchantName: 'Reliable Exchange',
    otp: '847291',
    createdAt: '2024-12-21T11:30:00',
  },
  {
    id: 'txn-5',
    type: 'cash-to-online',
    amount: 3000,
    commission: 45,
    status: 'cancelled',
    userId: 'user-1',
    userName: 'Rahul Sharma',
    merchantId: 'merchant-4',
    merchantName: 'FastPay Corner',
    createdAt: '2024-12-18T14:00:00',
  },
  {
    id: 'txn-6',
    type: 'online-to-cash',
    amount: 20000,
    commission: 300,
    status: 'completed',
    userId: 'user-2',
    userName: 'Anita Desai',
    merchantId: 'merchant-1',
    merchantName: 'Quick Cash Exchange',
    createdAt: '2024-12-20T16:45:00',
    completedAt: '2024-12-20T17:00:00',
    rating: 5,
  },
  {
    id: 'txn-7',
    type: 'cash-to-online',
    amount: 7500,
    commission: 112,
    status: 'pending',
    userId: 'user-3',
    userName: 'Karan M.',
    merchantId: 'merchant-1',
    merchantName: 'Quick Cash Exchange',
    createdAt: '2024-12-21T12:00:00',
  },
  {
    id: 'txn-8',
    type: 'online-to-cash',
    amount: 12000,
    commission: 240,
    status: 'completed',
    userId: 'user-1',
    userName: 'Rahul Sharma',
    merchantId: 'merchant-1',
    merchantName: 'Quick Cash Exchange',
    createdAt: '2024-12-17T11:00:00',
    completedAt: '2024-12-17T11:20:00',
  },
  {
    id: 'txn-9',
    type: 'cash-to-online',
    amount: 25000,
    commission: 375,
    status: 'completed',
    userId: 'user-4',
    userName: 'Deepak J.',
    merchantId: 'merchant-2',
    merchantName: 'Money Express Hub',
    createdAt: '2024-12-19T09:30:00',
    completedAt: '2024-12-19T09:50:00',
    rating: 4,
  },
  {
    id: 'txn-10',
    type: 'online-to-cash',
    amount: 6000,
    commission: 108,
    status: 'accepted',
    userId: 'user-5',
    userName: 'Sneha P.',
    merchantId: 'merchant-1',
    merchantName: 'Quick Cash Exchange',
    otp: '562918',
    createdAt: '2024-12-21T13:15:00',
  },
  /** Demo incoming requests for merchant-1 (Quick Cash Exchange) — merchant dashboard testing */
  {
    id: 'txn-demo-incoming-1',
    type: 'cash-to-online',
    amount: 3500,
    commission: 52.5,
    status: 'pending',
    userId: 'user-demo-a',
    userName: 'Vikram Malhotra',
    merchantId: 'merchant-1',
    merchantName: 'Quick Cash Exchange',
    amountGiven: 3500,
    amountReceived: 3447.5,
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-demo-incoming-2',
    type: 'online-to-cash',
    amount: 12000,
    commission: 180,
    status: 'pending',
    userId: 'user-demo-b',
    userName: 'Meera Iyer',
    merchantId: 'merchant-1',
    merchantName: 'Quick Cash Exchange',
    amountGiven: 12180,
    amountReceived: 12000,
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-demo-incoming-3',
    type: 'cash-to-online',
    amount: 8200,
    commission: 123,
    status: 'pending',
    userId: 'user-demo-c',
    userName: 'Arjun Nair',
    merchantId: 'merchant-1',
    merchantName: 'Quick Cash Exchange',
    amountGiven: 8200,
    amountReceived: 8077,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
]

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    merchantId: 'merchant-1',
    userId: 'user-1',
    userName: 'Rahul S.',
    rating: 5,
    comment: 'Excellent service! Very quick and the merchant was very professional.',
    createdAt: '2024-12-20T10:50:00',
  },
  {
    id: 'review-2',
    merchantId: 'merchant-1',
    userId: 'user-2',
    userName: 'Anita D.',
    rating: 5,
    comment: 'Best exchange service in the area. Highly recommended!',
    createdAt: '2024-12-20T17:05:00',
  },
  {
    id: 'review-3',
    merchantId: 'merchant-1',
    userId: 'user-4',
    userName: 'Deepak J.',
    rating: 4,
    comment: 'Good service overall. Could be a bit faster.',
    createdAt: '2024-12-18T14:30:00',
  },
  {
    id: 'review-4',
    merchantId: 'merchant-2',
    userId: 'user-1',
    userName: 'Rahul S.',
    rating: 4,
    comment: 'Reliable and trustworthy. Will use again.',
    createdAt: '2024-12-19T15:40:00',
  },
  {
    id: 'review-5',
    merchantId: 'merchant-3',
    userId: 'user-3',
    userName: 'Karan M.',
    rating: 5,
    comment: 'Amazing experience! Super fast and friendly.',
    createdAt: '2024-12-15T11:20:00',
  },
]

export const pendingKYCApplications = [
  {
    id: 'kyc-1',
    merchantId: 'merchant-pending-1',
    businessName: 'Cash Flow Hub',
    ownerName: 'Rajesh Mehta',
    phone: '+91 98123 45678',
    address: '56, Park Street, Kolkata',
    appliedDate: '2024-12-19',
    documents: ['aadhaar.pdf', 'pan.pdf', 'business_license.pdf'],
  },
  {
    id: 'kyc-2',
    merchantId: 'merchant-pending-2',
    businessName: 'Quick Money Services',
    ownerName: 'Sanjay Rao',
    phone: '+91 87654 32109',
    address: '89, Anna Nagar, Chennai',
    appliedDate: '2024-12-20',
    documents: ['aadhaar.pdf', 'pan.pdf'],
  },
]

export const adminStats = {
  totalUsers: 1247,
  totalMerchants: 156,
  todayTransactions: 89,
  totalVolume: 4567890,
  flaggedAccounts: 3,
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`
}

export function getTimeSince(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getBalanceLevel(balance: number): 'low' | 'medium' | 'high' {
  if (balance < 5000) return 'low'
  if (balance < 20000) return 'medium'
  return 'high'
}

export function isTransactionInFlight(status: TransactionStatus): boolean {
  return (
    status === 'pending' ||
    status === 'accepted' ||
    status === 'in-progress' ||
    status === 'otp_verified' ||
    status === 'payment_done'
  )
}
