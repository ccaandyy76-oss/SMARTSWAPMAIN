'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { QRCodeSVG } from 'qrcode.react'
import { Input } from '@/components/ui/input'
import { Clock, Check, X, AlertCircle, Navigation } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TransactionTypeBadge } from '@/components/shared/transaction-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmModal } from '@/components/shared/confirm-modal'
import { PromoBanner } from '@/components/shared/promo-banner'
import { useApp } from '@/context/app-context'
import { formatCurrency, getTimeSince } from '@/lib/mock-data'
import { toast } from 'sonner'

const Html5QrScanner = dynamic(() => import('@/components/exchange/html5-qr-scanner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">Starting camera…</div>
  ),
})

const DEMO_OTP_MS = 15000
const DEMO_PAY_MS = 15000

export default function MerchantRequestsPage() {
  const {
    currentMerchant,
    transactions,
    acceptTransaction,
    rejectTransaction,
    merchantVerifyOtp,
    confirmTransactionMerchant,
    markPaymentDone,
  } = useApp()

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    type: 'accept' | 'reject'
    transactionId: string | null
  }>({ open: false, type: 'accept', transactionId: null })

  const pendingRequests = transactions.filter(
    (t) => t.merchantId === currentMerchant?.id && t.status === 'pending'
  )

  const userOnTheWay = transactions.filter(
    (t) =>
      t.merchantId === currentMerchant?.id &&
      (t.status === 'accepted' || t.status === 'in-progress') &&
      !t.otp
  )

  const otpPending = transactions.filter(
    (t) =>
      t.merchantId === currentMerchant?.id &&
      !!t.otp &&
      (t.status === 'accepted' || t.status === 'in-progress')
  )

  const paymentPending = transactions.filter(
    (t) => t.merchantId === currentMerchant?.id && t.status === 'otp_verified'
  )

  const awaitingMerchantConfirm = transactions.filter(
    (t) =>
      t.merchantId === currentMerchant?.id &&
      t.status === 'payment_done' &&
      t.userConfirmed &&
      !t.merchantConfirmed
  )

  const handleAccept = (transactionId: string) => {
    setConfirmModal({ open: true, type: 'accept', transactionId })
  }

  const handleReject = (transactionId: string) => {
    setConfirmModal({ open: true, type: 'reject', transactionId })
  }

  const handleConfirm = () => {
    if (!confirmModal.transactionId) return

    if (confirmModal.type === 'accept') {
      acceptTransaction(confirmModal.transactionId)
      toast.success('Request accepted — user is notified.')
    } else {
      rejectTransaction(confirmModal.transactionId)
      toast.info('Request rejected')
    }
  }

  return (
    <div className="space-y-6 transition-[background-color,color] duration-300 ease-out">
      <PromoBanner
        type="alert"
        message="🔔 You have new exchange requests waiting!"
        link={{ href: '/merchant/requests', label: 'View' }}
        storageKey="promo-merchant-incoming-requests"
        className="mb-2"
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">Incoming Requests</h1>
          <p className="text-muted-foreground mt-1">
            {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
          </p>
        </div>

        {!currentMerchant?.isOnline && (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1">
            <AlertCircle className="w-3 h-3" />
            You&apos;re Offline
          </Badge>
        )}
      </div>

      {userOnTheWay.length > 0 && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              User is on the way
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userOnTheWay.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{t.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.type === 'cash-to-online' ? 'Cash → Online' : 'Online → Cash'} ·{' '}
                    {formatCurrency(t.amount)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Est. arrival ~{12 + (t.amount % 8)} min
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {otpPending.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="space-y-4 p-5">
            <h2 className="font-semibold">Enter OTP from user</h2>
            {otpPending.map((t) => (
              <OtpRow
                key={t.id}
                transaction={t}
                onVerify={(id, code) => {
                  const ok = merchantVerifyOtp(id, code)
                  if (ok) toast.success('OTP verified — proceed to payment')
                  else toast.error('Invalid OTP')
                }}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {paymentPending.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentPending.map((t) => (
              <MerchantPaymentBlock key={t.id} transaction={t} markPaymentDone={markPaymentDone} />
            ))}
          </CardContent>
        </Card>
      )}

      {awaitingMerchantConfirm.length > 0 && (
        <Card className="border border-primary/30 bg-primary/5">
          <CardContent className="space-y-3 p-5">
            <h2 className="font-semibold">Confirm completion</h2>
            {awaitingMerchantConfirm.map((t) => (
              <div key={t.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm">
                  {t.userName} · {formatCurrency(t.amount)}
                </span>
                <Button
                  size="sm"
                  className="bg-[#16A34A] text-white hover:bg-[#16A34A]/90"
                  onClick={() => {
                    confirmTransactionMerchant(t.id)
                    toast.success('Transaction marked complete')
                  }}
                >
                  Confirm — transaction completed
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {pendingRequests.length === 0 ? (
        <EmptyState
          variant="notifications"
          title="No pending requests"
          description={
            currentMerchant?.isOnline
              ? "You'll be notified when users send exchange requests"
              : 'Go online to start receiving exchange requests'
          }
        />
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <Card key={request.id} className="bg-card border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="font-semibold text-sm">
                          {request.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{request.userName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {getTimeSince(request.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <TransactionTypeBadge type={request.type} />
                      <span className="text-lg font-bold">{formatCurrency(request.amount)}</span>
                    </div>

                    <div className="mt-2 p-3 rounded-lg bg-primary/10 inline-block">
                      <p className="text-sm">
                        Your commission:{' '}
                        <span className="font-bold text-primary">{formatCurrency(request.commission)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      onClick={() => handleAccept(request.id)}
                      className="flex-1 sm:flex-none bg-[#16A34A] hover:bg-[#16A34A]/90 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                      className="flex-1 sm:flex-none border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirmModal.open}
        onOpenChange={(open) => setConfirmModal({ ...confirmModal, open })}
        title={confirmModal.type === 'accept' ? 'Accept Request?' : 'Reject Request?'}
        description={
          confirmModal.type === 'accept'
            ? 'Once accepted, the user can travel to your shop and generate an OTP when they arrive.'
            : 'Are you sure you want to reject this request? This action cannot be undone.'
        }
        confirmLabel={confirmModal.type === 'accept' ? 'Accept' : 'Reject'}
        onConfirm={handleConfirm}
        variant={confirmModal.type === 'reject' ? 'destructive' : 'default'}
      />
    </div>
  )
}

function MerchantPaymentBlock({
  transaction: t,
  markPaymentDone,
}: {
  transaction: import('@/lib/mock-data').Transaction
  markPaymentDone: (id: string) => void
}) {
  const [sec, setSec] = useState(15)

  useEffect(() => {
    // TODO: Remove auto-proceed timer in production
    const iv = window.setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000)
    const to = window.setTimeout(() => {
      markPaymentDone(t.id)
      toast.message('Payment step completed (demo auto-proceed)')
    }, DEMO_PAY_MS)
    return () => {
      window.clearInterval(iv)
      window.clearTimeout(to)
    }
  }, [t.id, markPaymentDone])

  return (
    <div className="space-y-4 border-b border-border pb-6 last:border-0 last:pb-0">
      <p className="text-sm font-medium">{t.userName}</p>
      <p className="text-xs text-amber-600/90 dark:text-amber-400/90">
        Auto-proceeding in {sec}s for demo…
      </p>
      {t.type === 'cash-to-online' ? (
        <div className="space-y-2">
          <p className="text-sm text-foreground">
            Scan user&apos;s QR code to complete online transfer ({formatCurrency(t.amountReceived ?? 0)} to user)
          </p>
          <Html5QrScanner onScan={() => toast.message('QR captured (demo)')} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-sm text-foreground">
            Show this QR to user — they will pay {formatCurrency(t.amountGiven ?? 0)} online
          </p>
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG value={`smartswap://pay/${t.id}?amt=${t.amountGiven ?? 0}`} size={160} />
          </div>
        </div>
      )}
      <Button
        className="w-full bg-[#16A34A] text-white hover:bg-[#16A34A]/90"
        onClick={() => {
          markPaymentDone(t.id)
          toast.success('Payment marked complete')
        }}
      >
        Payment received — continue
      </Button>
    </div>
  )
}

function OtpRow({
  transaction,
  onVerify,
}: {
  transaction: import('@/lib/mock-data').Transaction
  onVerify: (id: string, code: string) => void
}) {
  const [code, setCode] = useState('')
  const [sec, setSec] = useState(15)
  const onVerifyRef = useRef(onVerify)
  onVerifyRef.current = onVerify

  useEffect(() => {
    if (!transaction.otp) return
    // TODO: Remove auto-proceed timer in production
    const iv = window.setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000)
    const to = window.setTimeout(() => {
      onVerifyRef.current(transaction.id, transaction.otp!)
    }, DEMO_OTP_MS)
    return () => {
      window.clearInterval(iv)
      window.clearTimeout(to)
    }
  }, [transaction.id, transaction.otp])

  return (
    <div className="flex flex-wrap items-end gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{transaction.userName}</p>
        <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90">
          Auto-verify in {sec}s for demo…
        </p>
        <Input
          placeholder="6-digit OTP"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="mt-1 max-w-xs border-border bg-secondary"
        />
      </div>
      <Button size="sm" onClick={() => onVerify(transaction.id, code)}>
        Verify
      </Button>
    </div>
  )
}
