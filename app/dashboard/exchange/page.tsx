'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Banknote,
  Smartphone,
  Map,
  List,
  Navigation,
  Loader2,
  CheckCircle2,
  PartyPopper,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AmountInput } from '@/components/shared/amount-input'
import { MerchantCard } from '@/components/shared/merchant-card'
import { MerchantsLeafletMap } from '@/components/dashboard/merchants-leaflet-map'
import { StarRating } from '@/components/shared/star-rating'
import { useApp } from '@/context/app-context'
import { PromoBanner } from '@/components/shared/promo-banner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/mock-data'

const Html5QrScanner = dynamic(() => import('@/components/exchange/html5-qr-scanner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
      Starting camera…
    </div>
  ),
})

const ExchangeRouteMap = dynamic(
  () => import('@/components/exchange/exchange-route-map').then((mod) => mod.ExchangeRouteMap),
  {
    ssr: false,
    loading: () => <div className="h-full min-h-[260px] w-full animate-pulse rounded-xl bg-secondary" />,
  }
)

type ExchangeType = 'cash-to-online' | 'online-to-cash'
type Phase =
  | 'request'
  | 'browse'
  | 'merchant-confirm'
  | 'waiting'
  | 'route'
  | 'otp'
  | 'payment'
  | 'verify'
  | 'success'

const DEMO_WAIT_MS = 15000

export default function ExchangePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    merchants,
    transactions,
    createTransaction,
    activeTransaction,
    setActiveTransaction,
    acceptTransaction,
    updateTransaction,
    userGenerateOtp,
    markPaymentDone,
    confirmTransactionUser,
    confirmTransactionMerchant,
    merchantVerifyOtp,
    rateTransaction,
  } = useApp()

  const initialMerchant = searchParams.get('merchant')

  const [phase, setPhase] = useState<Phase>('request')
  const [view, setView] = useState<'map' | 'list'>('map')
  const [query, setQuery] = useState('')
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [exchangeType, setExchangeType] = useState<ExchangeType>('cash-to-online')
  const [amount, setAmount] = useState(5000)
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null)
  const [txnId, setTxnId] = useState<string | null>(null)
  const [commissionSummary, setCommissionSummary] = useState<string | null>(null)
  const [routeMeta, setRouteMeta] = useState({ distanceKm: 0, durationMin: 0 })
  const [rating, setRating] = useState(5)
  const [ratingComment, setRatingComment] = useState('')
  const [demoCountdown, setDemoCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPos([28.5706, 77.3219]),
      { timeout: 8000 }
    )
  }, [])

  const liveTx = useMemo(
    () => (txnId ? transactions.find((t) => t.id === txnId) : null) ?? activeTransaction,
    [transactions, txnId, activeTransaction]
  )

  useEffect(() => {
    if (!liveTx?.id) return
    if (liveTx.status === 'accepted' && phase === 'waiting') {
      setPhase('route')
      updateTransaction(liveTx.id, { status: 'in-progress' })
    }
  }, [liveTx?.id, liveTx?.status, phase, updateTransaction])

  useEffect(() => {
    if (!liveTx?.id) return
    if (liveTx.status === 'otp_verified' && phase === 'otp') {
      setPhase('payment')
    }
  }, [liveTx?.id, liveTx?.status, phase])

  useEffect(() => {
    if (liveTx?.status === 'completed' && phase === 'verify') {
      setPhase('success')
    }
  }, [liveTx?.status, phase, liveTx?.id])

  // Waiting: auto-accept for demo
  useEffect(() => {
    if (phase !== 'waiting' || !txnId) return
    // TODO: Remove auto-proceed timer in production (merchant should accept manually)
    const t = window.setTimeout(() => acceptTransaction(txnId), DEMO_WAIT_MS)
    return () => window.clearTimeout(t)
  }, [phase, txnId, acceptTransaction])

  // OTP: auto-verify for demo
  useEffect(() => {
    if (phase !== 'otp' || !liveTx?.id || !liveTx.otp) return
    if (liveTx.status === 'otp_verified') return
    setDemoCountdown(15)
    const iv = window.setInterval(() => {
      setDemoCountdown((c) => (c !== null && c > 0 ? c - 1 : c))
    }, 1000)
    const t = window.setTimeout(() => {
      merchantVerifyOtp(liveTx.id, liveTx.otp!)
      toast.success('OTP verified (demo auto-proceed)')
      window.clearInterval(iv)
      setDemoCountdown(null)
    }, DEMO_WAIT_MS)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(iv)
      setDemoCountdown(null)
    }
  }, [phase, liveTx?.id, liveTx?.otp, merchantVerifyOtp])

  // Payment: auto-proceed for demo
  useEffect(() => {
    if (phase !== 'payment' || !liveTx?.id) return
    if (liveTx.status === 'payment_done' || liveTx.status === 'completed') return
    setDemoCountdown(15)
    const iv = window.setInterval(() => {
      setDemoCountdown((c) => (c !== null && c > 0 ? c - 1 : c))
    }, 1000)
    const t = window.setTimeout(() => {
      markPaymentDone(liveTx.id)
      setPhase('verify')
      toast.message('Payment step recorded (demo auto-proceed)')
      window.clearInterval(iv)
      setDemoCountdown(null)
    }, DEMO_WAIT_MS)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(iv)
      setDemoCountdown(null)
    }
  }, [phase, liveTx?.id, markPaymentDone])

  // Verify: auto user confirm for demo
  useEffect(() => {
    if (phase !== 'verify' || !liveTx?.id || liveTx.status !== 'payment_done') return
    if (liveTx.userConfirmed) return
    setDemoCountdown(15)
    const iv = window.setInterval(() => {
      setDemoCountdown((c) => (c !== null && c > 0 ? c - 1 : c))
    }, 1000)
    const t = window.setTimeout(() => {
      confirmTransactionUser(liveTx.id)
      window.clearInterval(iv)
      setDemoCountdown(null)
    }, DEMO_WAIT_MS)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(iv)
      setDemoCountdown(null)
    }
  }, [phase, liveTx?.id, liveTx?.status, liveTx?.userConfirmed, confirmTransactionUser])

  // Verify: auto merchant confirm for demo (single-device testing)
  useEffect(() => {
    if (phase !== 'verify' || !liveTx?.id) return
    if (!liveTx.userConfirmed || liveTx.merchantConfirmed || liveTx.status === 'completed') return
    setDemoCountdown(15)
    const iv = window.setInterval(() => {
      setDemoCountdown((c) => (c !== null && c > 0 ? c - 1 : c))
    }, 1000)
    const t = window.setTimeout(() => {
      confirmTransactionMerchant(liveTx.id)
      window.clearInterval(iv)
      setDemoCountdown(null)
    }, DEMO_WAIT_MS)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(iv)
      setDemoCountdown(null)
    }
  }, [
    phase,
    liveTx?.id,
    liveTx?.userConfirmed,
    liveTx?.merchantConfirmed,
    liveTx?.status,
    confirmTransactionMerchant,
  ])

  const filteredMerchants = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = merchants.filter((m) => m.isOnline)
    if (q) {
      list = list.filter(
        (m) =>
          m.businessName.toLowerCase().includes(q) || m.address.toLowerCase().includes(q)
      )
    }
    return list
  }, [merchants, query])

  const selectedMerchant = merchants.find((m) => m.id === selectedMerchantId)

  const fetchCommissionPreview = useCallback(async () => {
    if (!selectedMerchant || phase !== 'merchant-confirm') return
    try {
      const res = await fetch('/api/exchange/commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          exchangeType,
          commissionRatePercent: selectedMerchant.commissionRate,
        }),
      })
      if (res.ok) {
        const data = (await res.json()) as { summary: string }
        setCommissionSummary(data.summary)
      }
    } catch {
      setCommissionSummary(null)
    }
  }, [amount, exchangeType, selectedMerchant, phase])

  useEffect(() => {
    void fetchCommissionPreview()
  }, [fetchCommissionPreview])

  const handleFindMerchant = () => {
    if (amount < 100 || amount > 50000) {
      toast.error('Amount must be between ₹100 and ₹50,000')
      return
    }
    setPhase('browse')
    if (initialMerchant && merchants.some((m) => m.id === initialMerchant && m.isOnline)) {
      setSelectedMerchantId(initialMerchant)
    }
  }

  const handleSelectMerchant = (id: string) => {
    setSelectedMerchantId(id)
    setPhase('merchant-confirm')
  }

  const handleSendRequest = async () => {
    if (!selectedMerchantId) return
    if (amount < 100 || amount > 50000) {
      toast.error('Amount must be between ₹100 and ₹50,000')
      return
    }
    try {
      const tx = await createTransaction(exchangeType, amount, selectedMerchantId)
      setTxnId(tx.id)
      setActiveTransaction(tx)
      setPhase('waiting')
      toast.success('Request sent. Waiting for merchant…')
    } catch {
      toast.error('Could not create request')
    }
  }

  const handleReachedGetOtp = () => {
    if (!liveTx?.id) return
    userGenerateOtp(liveTx.id)
    toast.success('OTP generated — share with the merchant.')
    setPhase('otp')
  }

  const handlePaymentSimulated = () => {
    if (!liveTx?.id) return
    markPaymentDone(liveTx.id)
    setPhase('verify')
    toast.success('Payment recorded')
  }

  const handleUserFinalize = () => {
    if (!liveTx?.id) return
    confirmTransactionUser(liveTx.id)
    toast.success('Your confirmation saved')
  }

  const handleRateAndFinish = () => {
    if (!liveTx?.id) return
    rateTransaction(liveTx.id, rating, ratingComment)
    setActiveTransaction(null)
    setTxnId(null)
    setPhase('request')
    setSelectedMerchantId(null)
    router.push('/dashboard/history')
    toast.success('Thanks! See History for details.')
  }

  const openMaps = () => {
    if (!userPos || !selectedMerchant) return
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userPos[0]},${userPos[1]}&destination=${selectedMerchant.latitude},${selectedMerchant.longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const tx = liveTx

  const breakdownLine =
    exchangeType === 'cash-to-online'
      ? `Give ${formatCurrency(amount)} cash → Receive ${formatCurrency(Math.max(0, amount - (selectedMerchant ? (amount * selectedMerchant.commissionRate) / 100 : 0)))} online`
      : `Pay ${formatCurrency(amount + (selectedMerchant ? (amount * selectedMerchant.commissionRate) / 100 : 0))} online → Receive ${formatCurrency(amount)} cash`

  return (
    <div className="mx-auto max-w-2xl space-y-6 transition-[background-color,color] duration-300 ease-out">
      <div>
        <PromoBanner
          type="feature"
          message="Exchange: choose amount → find a merchant → meet & complete."
          link={{ href: '/dashboard/exchange', label: 'Start' }}
          storageKey="promo-user-start-exchange-v3"
          className="mb-2"
        />
        <h1 className="font-heading text-2xl font-bold md:text-3xl">Exchange</h1>
        <p className="mt-1 text-muted-foreground">
          {phase === 'request' && 'Enter exchange type and amount'}
          {phase === 'browse' && 'Find a merchant on the map or list'}
          {phase === 'merchant-confirm' && 'Review and send your request'}
          {phase === 'waiting' && 'Waiting for merchant response'}
          {phase === 'route' && 'Follow the route to the shop'}
          {phase === 'otp' && 'Share OTP with merchant'}
          {phase === 'payment' && 'Complete payment'}
          {phase === 'verify' && 'Verify transaction'}
          {phase === 'success' && 'All done'}
        </p>
      </div>

      {phase === 'request' && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Exchange request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExchangeType('cash-to-online')}
                className={cn(
                  'rounded-xl border p-3 text-left text-sm transition',
                  exchangeType === 'cash-to-online'
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border'
                )}
              >
                <Banknote className="mb-2 h-6 w-6 text-blue-400" />
                Cash → Online
              </button>
              <button
                type="button"
                onClick={() => setExchangeType('online-to-cash')}
                className={cn(
                  'rounded-xl border p-3 text-left text-sm transition',
                  exchangeType === 'online-to-cash'
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border'
                )}
              >
                <Smartphone className="mb-2 h-6 w-6 text-orange-400" />
                Online → Cash
              </button>
            </div>

            <AmountInput value={amount} onChange={setAmount} min={100} max={50000} />

            <Button
              className="w-full bg-primary text-primary-foreground"
              size="lg"
              onClick={handleFindMerchant}
            >
              Find merchant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === 'browse' && (
        <div className="space-y-4">
          <Input
            placeholder="Search merchant or area…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-border bg-secondary"
          />
          <Tabs value={view} onValueChange={(v) => setView(v as 'map' | 'list')}>
            <TabsList className="h-10 bg-secondary">
              <TabsTrigger
                value="map"
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Map className="mr-1 h-3.5 w-3.5" />
                Map view
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <List className="mr-1 h-3.5 w-3.5" />
                List view
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {view === 'map' && (
            <div className="space-y-2">
              <Card className="overflow-hidden border-border bg-card">
                <CardContent className="p-0">
                  <div className="relative h-[300px] md:h-[380px]">
                    <MerchantsLeafletMap
                      merchants={filteredMerchants}
                      userLatLng={userPos}
                      className="relative h-full w-full"
                      onSelectMerchant={handleSelectMerchant}
                      selectedMerchantId={selectedMerchantId}
                    />
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground">
                Tap a pin or use <strong>List view</strong> to select a merchant.
              </p>
            </div>
          )}

          {view === 'list' && (
            <div className="space-y-3">
              {filteredMerchants.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No online merchants match your search.
                </p>
              ) : (
                filteredMerchants.map((m, index) => (
                  <MerchantCard
                    key={m.id}
                    merchant={m}
                    distance={0.35 + index * 0.25}
                    actionLabel="Select"
                    onRequestExchange={() => handleSelectMerchant(m.id)}
                  />
                ))
              )}
            </div>
          )}

          <Button variant="outline" className="w-full border-border" onClick={() => setPhase('request')}>
            Back
          </Button>
        </div>
      )}

      {phase === 'merchant-confirm' && selectedMerchant && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Confirm & send</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{selectedMerchant.ownerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.businessName}</p>
                  <div className="mt-2">
                    <StarRating value={Math.round(selectedMerchant.rating)} readonly size="sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Exchange type: </span>
                {exchangeType === 'cash-to-online' ? 'Cash → Online' : 'Online → Cash'}
              </p>
              <p>
                <span className="text-muted-foreground">Amount: </span>
                {formatCurrency(amount)}
              </p>
              <p>
                <span className="text-muted-foreground">Commission ({selectedMerchant.commissionRate}%): </span>
                {formatCurrency((amount * selectedMerchant.commissionRate) / 100)}
              </p>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs font-medium text-muted-foreground">Final amount</p>
                <p className="mt-1 font-medium leading-snug text-foreground">
                  {commissionSummary || breakdownLine}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-border" onClick={() => setPhase('browse')}>
                Back
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleSendRequest}>
                Send request to merchant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === 'waiting' && (
        <Card className="border-border bg-card">
          <CardContent className="space-y-6 py-10 text-center">
            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-primary/15">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Waiting for merchant to accept…</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {/* TODO: Remove auto-proceed timer in production */}
                This demo auto-accepts in {DEMO_WAIT_MS / 1000}s so you can continue without another device.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-border"
              onClick={() => {
                setPhase('request')
                setTxnId(null)
                setActiveTransaction(null)
              }}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === 'route' && selectedMerchant && userPos && tx && (
        <div className="space-y-4">
          <Card className="overflow-hidden border-border bg-card">
            <CardContent className="relative p-0">
              <div className="relative h-[280px] md:h-[340px]">
                <ExchangeRouteMap
                  userLatLng={userPos}
                  merchantLatLng={[selectedMerchant.latitude, selectedMerchant.longitude]}
                  merchantName={selectedMerchant.businessName}
                  onRouteMeta={setRouteMeta}
                  className="relative h-full w-full"
                />
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-3 pt-10 text-left text-xs md:text-sm">
                  <p className="pointer-events-none font-medium text-foreground drop-shadow-sm">
                    ~{routeMeta.distanceKm.toFixed(1)} km · ~{Math.round(routeMeta.durationMin)} min
                  </p>
                  <p className="pointer-events-none mt-1 text-muted-foreground drop-shadow-sm">
                    {selectedMerchant.address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="button" className="w-full border-border md:w-auto" variant="outline" onClick={openMaps}>
            <Navigation className="mr-2 h-4 w-4" />
            Navigate
          </Button>

          <Card className="border-border bg-card">
            <CardContent className="space-y-2 p-4 text-sm">
              <p className="font-medium">{selectedMerchant.businessName}</p>
              <p className="text-muted-foreground">{selectedMerchant.address}</p>
              <p>
                {tx.type === 'cash-to-online' ? 'Cash → Online' : 'Online → Cash'} ·{' '}
                {formatCurrency(tx.amount)}
              </p>
            </CardContent>
          </Card>

          <Button className="w-full bg-primary text-primary-foreground" size="lg" onClick={handleReachedGetOtp}>
            I&apos;ve reached — Get OTP
          </Button>
        </div>
      )}

      {phase === 'otp' && tx && (
        <Card className="border-border bg-card">
          <CardContent className="space-y-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">Share this OTP with the merchant.</p>
            {tx.otp && (
              <p className="font-mono text-4xl font-bold tracking-[0.3em] text-primary">{tx.otp}</p>
            )}
            <p className="text-xs text-amber-600/90 dark:text-amber-400/90">
              {/* TODO: Remove auto-proceed timer in production */}
              Auto-proceeding in {demoCountdown ?? 15}s for demo…
            </p>
          </CardContent>
        </Card>
      )}

      {phase === 'payment' && tx && selectedMerchant && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-amber-600/90 dark:text-amber-400/90">
              {/* TODO: Remove auto-proceed timer in production */}
              Auto-proceeding in {demoCountdown ?? 15}s for demo…
            </p>

            {tx.type === 'cash-to-online' ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-center text-sm text-foreground">
                  Show this QR to merchant — you will receive {formatCurrency(tx.amountReceived ?? 0)} online
                </p>
                <div className="rounded-xl bg-white p-3">
                  <QRCodeSVG
                    value={`smartswap://txn/${tx.id}?receive=${tx.amountReceived ?? 0}`}
                    size={180}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-sm text-foreground">
                  Scan merchant&apos;s QR or pay {formatCurrency(tx.amountGiven ?? 0)} online to receive{' '}
                  {formatCurrency(tx.amount)} cash
                </p>
                <Html5QrScanner
                  onScan={() => {
                    toast.message('QR captured (demo)')
                  }}
                />
              </div>
            )}

            <Button className="w-full bg-[#10B981] text-white hover:bg-[#10B981]/90" onClick={handlePaymentSimulated}>
              I&apos;ve completed payment
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === 'verify' && tx && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Transaction verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-amber-600/90 dark:text-amber-400/90">
              {/* TODO: Remove auto-proceed timer in production */}
              Auto-proceeding in {demoCountdown ?? 15}s for demo…
            </p>
            <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Transaction ID: </span>
                <span className="font-mono text-foreground">{tx.id}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Type: </span>
                {tx.type === 'cash-to-online' ? 'Cash → Online' : 'Online → Cash'}
              </p>
              <p>
                <span className="text-muted-foreground">Amount given: </span>
                {formatCurrency(tx.amountGiven ?? tx.amount)}
              </p>
              <p>
                <span className="text-muted-foreground">Amount received: </span>
                {formatCurrency(tx.amountReceived ?? tx.amount)}
              </p>
              <p>
                <span className="text-muted-foreground">Commission: </span>
                {formatCurrency(tx.commission)}
              </p>
              <p>
                <span className="text-muted-foreground">Merchant: </span>
                {selectedMerchant?.businessName ?? tx.merchantName}
              </p>
              <p>
                <span className="text-muted-foreground">When: </span>
                {new Date(tx.createdAt).toLocaleString('en-IN')}
              </p>
            </div>

            {tx.status !== 'completed' && (
              <Button className="w-full bg-primary text-primary-foreground" onClick={handleUserFinalize}>
                Confirm — I received my {tx.type === 'cash-to-online' ? 'online money' : 'cash'}
              </Button>
            )}

            {tx.userConfirmed && tx.status !== 'completed' && (
              <p className="text-center text-sm text-muted-foreground">Waiting for merchant confirmation…</p>
            )}
          </CardContent>
        </Card>
      )}

      {phase === 'success' && tx && (
        <Card className="border-border bg-card">
          <CardContent className="space-y-6 py-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 animate-[pulse_2s_ease-in-out_infinite]">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <CheckCircle2 className="mx-auto h-14 w-14 text-[#16A34A]" />
            <p className="text-xl font-bold font-heading">Transaction successful! 🎉</p>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Rate your experience</p>
              <div className="flex justify-center">
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>
            </div>
            <Textarea
              placeholder="Optional comment"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="border-border bg-secondary text-left"
              rows={3}
            />
            <Button className="w-full bg-primary text-primary-foreground" onClick={handleRateAndFinish}>
              <PartyPopper className="mr-2 h-4 w-4" />
              Go to dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
