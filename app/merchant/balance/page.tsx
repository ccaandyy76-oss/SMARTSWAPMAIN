'use client'

import { useState } from 'react'
import { Banknote, Smartphone, AlertTriangle, History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/app-context'
import { formatCurrency } from '@/lib/mock-data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PromoBanner } from '@/components/shared/promo-banner'

const balanceHistory = [
  { id: 1, type: 'cash', amount: 45000, date: '2024-12-20', action: 'Updated' },
  { id: 2, type: 'online', amount: 38000, date: '2024-12-20', action: 'Updated' },
  { id: 3, type: 'cash', amount: 40000, date: '2024-12-18', action: 'Updated' },
  { id: 4, type: 'online', amount: 35000, date: '2024-12-18', action: 'Updated' },
]

export default function MerchantBalancePage() {
  const { currentMerchant, updateMerchantBalance } = useApp()
  
  const [cashBalance, setCashBalance] = useState(currentMerchant?.cashBalance?.toString() || '0')
  const [onlineBalance, setOnlineBalance] = useState(currentMerchant?.onlineBalance?.toString() || '0')

  const handleUpdateCash = () => {
    const amount = parseInt(cashBalance, 10) || 0
    updateMerchantBalance('cash', amount)
    toast.success('Cash balance updated')
  }

  const handleUpdateOnline = () => {
    const amount = parseInt(onlineBalance, 10) || 0
    updateMerchantBalance('online', amount)
    toast.success('Online balance updated')
  }

  const cashLow = (currentMerchant?.cashBalance || 0) < 5000
  const onlineLow = (currentMerchant?.onlineBalance || 0) < 5000

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <PromoBanner
          type="offer"
          message="💰 Withdraw your balance with zero charges today!"
          link={{ href: '/merchant/balance', label: 'Open' }}
          storageKey="promo-merchant-balance-management"
          className="mb-2"
        />
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Balance Management</h1>
        <p className="text-muted-foreground mt-1">
          Update your available cash and online balance
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cash Balance */}
        <Card className={cn(
          'bg-card border-border',
          cashLow && 'border-destructive/50'
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-[#10B981]" />
              Cash Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className={cn(
                'text-3xl font-bold',
                cashLow ? 'text-destructive' : 'text-[#10B981]'
              )}>
                {formatCurrency(currentMerchant?.cashBalance || 0)}
              </p>
            </div>

            {cashLow && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Balance below ₹5,000 minimum
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cashBalance">Update Balance</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="cashBalance"
                    type="number"
                    value={cashBalance}
                    onChange={(e) => setCashBalance(e.target.value)}
                    className="bg-secondary border-border pl-8"
                  />
                </div>
                <Button 
                  onClick={handleUpdateCash}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Online Balance */}
        <Card className={cn(
          'bg-card border-border',
          onlineLow && 'border-destructive/50'
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              Online Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className={cn(
                'text-3xl font-bold',
                onlineLow ? 'text-destructive' : 'text-blue-400'
              )}>
                {formatCurrency(currentMerchant?.onlineBalance || 0)}
              </p>
            </div>

            {onlineLow && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Balance below ₹5,000 minimum
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="onlineBalance">Update Balance</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="onlineBalance"
                    type="number"
                    value={onlineBalance}
                    onChange={(e) => setOnlineBalance(e.target.value)}
                    className="bg-secondary border-border pl-8"
                  />
                </div>
                <Button 
                  onClick={handleUpdateOnline}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Balance Update History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {balanceHistory.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  {item.type === 'cash' ? (
                    <Banknote className="w-5 h-5 text-[#10B981]" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-blue-400" />
                  )}
                  <div>
                    <p className="font-medium">
                      {item.type === 'cash' ? 'Cash' : 'Online'} Balance {item.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <p className="font-semibold">{formatCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
