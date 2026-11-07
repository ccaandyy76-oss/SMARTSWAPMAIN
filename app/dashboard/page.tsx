'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  History,
  MapPin,
  ArrowRightLeft,
  User,
  Store,
} from 'lucide-react'
import { MerchantsLeafletMap } from '@/components/dashboard/merchants-leaflet-map'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TransactionTypeBadge, TransactionStatusBadge } from '@/components/shared/transaction-badge'
import { useApp } from '@/context/app-context'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/lib/mock-data'
import { PromoBanner } from '@/components/shared/promo-banner'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { currentUser, transactions, merchants, approveShopApplication } = useApp()
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [mapLoading, setMapLoading] = useState(true)

  const userTransactions = useMemo(
    () => transactions.filter((t) => t.userId === currentUser?.id).slice(0, 4),
    [transactions, currentUser?.id]
  )

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setMapLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude])
        setMapLoading(false)
      },
      () => setMapLoading(false),
      { enableHighAccuracy: false, timeout: 8000 }
    )
  }, [])

  const showKycBanner =
    currentUser?.kycStatus !== 'verified' &&
    (currentUser?.kycSkipped ||
      currentUser?.kycStatus === 'not_started' ||
      currentUser?.kycStatus === 'pending' ||
      currentUser?.kycStatus === 'failed')

  const quickActions = [
    { href: '/dashboard/exchange?type=cash-to-online', label: 'Send Cash', icon: ArrowUpRight, color: 'bg-blue-500/15 text-blue-400', badge: null as string | null },
    { href: '/dashboard/exchange?type=online-to-cash', label: 'Request Cash', icon: ArrowDownRight, color: 'bg-orange-500/15 text-orange-400', badge: null },
    { href: '/dashboard/merchants', label: 'Nearby', icon: MapPin, color: 'bg-primary/15 text-primary', badge: null },
    { href: '/dashboard/add-shop', label: 'Add Shop', icon: Store, color: 'bg-amber-500/15 text-amber-400', badge: 'Start Earning →' },
    { href: '/dashboard/history', label: 'History', icon: History, color: 'bg-emerald-500/15 text-emerald-400', badge: null },
    { href: '/dashboard/profile', label: 'Profile', icon: User, color: 'bg-violet-500/15 text-violet-400', badge: null },
  ]

  return (
    <div className="space-y-5">
      {showKycBanner && (
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm">
          <p className="font-medium text-yellow-100">Complete KYC to exchange with full limits</p>
          <p className="mt-1 text-xs text-yellow-100/80">
            Verify your identity to keep your account secure.
          </p>
          <Button size="sm" className="mt-2 bg-primary text-primary-foreground" asChild>
            <Link href="/auth/kyc">Complete KYC</Link>
          </Button>
        </div>
      )}

      <PromoBanner
        type="offer"
        message="Zero-fee weekend on select merchants — tap Map to explore."
        link={{ href: '/dashboard/merchants', label: 'Map' }}
        storageKey="promo-user-dashboard-welcome"
      />

      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {quickActions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex min-w-[4.5rem] flex-col items-center gap-1.5 shrink-0"
          >
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl">
              <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', a.color)}>
                <a.icon className="h-6 w-6" />
              </span>
              {a.badge && (
                <span className="absolute -bottom-1 left-1/2 max-w-[5.5rem] -translate-x-1/2 whitespace-nowrap rounded-full bg-primary/90 px-1.5 py-0.5 text-[8px] font-semibold leading-none text-primary-foreground shadow-sm">
                  {a.badge}
                </span>
              )}
            </span>
            <span className="max-w-[4.5rem] text-center text-[11px] font-medium leading-tight text-foreground">
              {a.label}
            </span>
          </Link>
        ))}
      </div>

      {currentUser?.shopApplication && (
        <Card className="border-border bg-card">
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Shop status</p>
              <Badge
                className={
                  currentUser.shopApplication.status === 'pending'
                    ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25'
                    : currentUser.shopApplication.status === 'approved'
                      ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/25'
                      : 'bg-destructive/15 text-destructive border-destructive/25'
                }
              >
                {currentUser.shopApplication.status === 'pending' && 'Under review'}
                {currentUser.shopApplication.status === 'approved' && 'Approved — Active'}
                {currentUser.shopApplication.status === 'rejected' && 'Rejected'}
              </Badge>
            </div>
            {currentUser.shopApplication.status === 'rejected' &&
              currentUser.shopApplication.rejectionReason && (
                <p className="text-xs text-muted-foreground">
                  {currentUser.shopApplication.rejectionReason}
                </p>
              )}
            {currentUser.shopApplication.status === 'pending' && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="border-border" asChild>
                  <Link href="/dashboard/add-shop">View application</Link>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                  type="button"
                  onClick={() => approveShopApplication()}
                >
                  Simulate approval (demo)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading">Nearby on map</h2>
          <Button variant="ghost" size="sm" className="text-primary" asChild>
            <Link href="/dashboard/merchants">
              Full map <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="relative h-[220px] overflow-hidden rounded-xl border border-border md:h-[280px]">
          {mapLoading ? (
            <Skeleton className="h-full w-full rounded-xl" />
          ) : (
            <MerchantsLeafletMap merchants={merchants} userLatLng={userPos} className="relative h-full w-full" />
          )}
        </div>
        <div className="mt-3 space-y-2">
          {merchants.slice(0, 3).map((m, index) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.businessName}</p>
                <p className="text-xs text-muted-foreground">
                  {(0.4 + index * 0.35).toFixed(1)} km · {m.rating}★ · {m.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <Button size="sm" className="shrink-0 bg-primary text-primary-foreground" asChild>
                <Link href={`/dashboard/exchange?merchant=${m.id}`}>Exchange</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base">Recent transactions</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary" asChild>
            <Link href="/dashboard/history">All</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {userTransactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No activity yet. Start an exchange from the quick actions.
            </div>
          ) : (
            userTransactions.map((transaction) => (
              <Link
                key={transaction.id}
                href="/dashboard/history"
                className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-3 transition hover:bg-secondary/70"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      transaction.type === 'cash-to-online' ? 'bg-blue-500/15' : 'bg-orange-500/15'
                    )}
                  >
                    {transaction.type === 'cash-to-online' ? (
                      <ArrowUpRight className="h-5 w-5 text-blue-400" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-orange-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                      <TransactionStatusBadge status={transaction.status} />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {transaction.merchantName} · {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <TransactionTypeBadge type={transaction.type} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-center">
        <ArrowRightLeft className="mx-auto mb-2 h-8 w-8 text-primary opacity-80" />
        <p className="text-sm font-medium">Need another exchange?</p>
        <Button className="mt-2 bg-primary text-primary-foreground" asChild>
          <Link href="/dashboard/exchange">Start exchange</Link>
        </Button>
      </div>
    </div>
  )
}
