'use client'

import Link from 'next/link'
import { TrendingUp, ArrowRightLeft, Star, AlertCircle, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useApp } from '@/context/app-context'
import { formatCurrency } from '@/lib/mock-data'
import { toast } from 'sonner'
import { PromoBanner } from '@/components/shared/promo-banner'

export default function MerchantDashboardPage() {
  const { currentMerchant, transactions, toggleMerchantOnline } = useApp()

  const merchantTransactions = transactions.filter(
    t => t.merchantId === currentMerchant?.id
  )
  const pendingRequests = merchantTransactions.filter(t => t.status === 'pending')
  const todayTransactions = merchantTransactions.filter(t => {
    const today = new Date().toDateString()
    return new Date(t.createdAt).toDateString() === today
  })
  const weekTransactions = merchantTransactions.filter(t => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(t.createdAt) > weekAgo
  })

  const handleToggleOnline = () => {
    toggleMerchantOnline()
    toast.success(currentMerchant?.isOnline ? 'You are now offline' : 'You are now online')
  }

  return (
    <div className="space-y-6">
      <PromoBanner
        type="feature"
        message="📢 Boost your visibility — upgrade to Pro Merchant!"
        link={{ href: '/merchant/reviews', label: 'View' }}
        storageKey="promo-merchant-dashboard"
        className="mb-2"
      />

      {/* Header with Online Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">
            Merchant Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentMerchant?.businessName}
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {currentMerchant?.isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentMerchant?.isOnline ? 'Accepting requests' : 'Not visible to users'}
              </p>
            </div>
            <Switch
              checked={currentMerchant?.isOnline}
              onCheckedChange={handleToggleOnline}
              className="data-[state=checked]:bg-[#10B981]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  Users are waiting for your response
                </p>
              </div>
            </div>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/merchant/requests">View Requests</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Earnings Card */}
      <Card className="bg-gradient-to-r from-primary/20 to-[#10B981]/20 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(currentMerchant?.totalEarnings || 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#10B981]">
            <TrendingUp className="w-4 h-4" />
            <span>+12% from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{todayTransactions.length}</p>
            <p className="text-xs text-muted-foreground">Today&apos;s Exchanges</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{weekTransactions.length}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-primary text-primary" />
              <p className="text-2xl font-bold">{currentMerchant?.rating.toFixed(1)}</p>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{pendingRequests.length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Warning */}
      {(currentMerchant?.cashBalance || 0) < 5000 || (currentMerchant?.onlineBalance || 0) < 5000 ? (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Low Balance Warning</p>
              <p className="text-sm text-muted-foreground">
                {(currentMerchant?.cashBalance || 0) < 5000 && 'Cash balance is low. '}
                {(currentMerchant?.onlineBalance || 0) < 5000 && 'Online balance is low.'}
              </p>
            </div>
            <Button variant="outline" asChild className="border-destructive text-destructive hover:bg-destructive/10">
              <Link href="/merchant/balance">Update Balance</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/merchant/requests">
          <Card className="bg-card border-border card-hover cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowRightLeft className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Incoming Requests</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage exchange requests
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/merchant/reviews">
          <Card className="bg-card border-border card-hover cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                <Star className="w-7 h-7 text-[#10B981]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ratings & Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  See what customers say about you
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
