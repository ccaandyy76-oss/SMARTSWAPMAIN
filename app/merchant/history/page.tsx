'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TransactionTypeBadge, TransactionStatusBadge } from '@/components/shared/transaction-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { useApp } from '@/context/app-context'
import { PromoBanner } from '@/components/shared/promo-banner'
import { formatCurrency, formatDateTime } from '@/lib/mock-data'

type FilterStatus = 'all' | 'completed' | 'cancelled'

export default function MerchantHistoryPage() {
  const { currentMerchant, transactions } = useApp()
  const [filter, setFilter] = useState<FilterStatus>('all')

  const merchantTransactions = transactions.filter(
    t => t.merchantId === currentMerchant?.id && t.status !== 'pending' && t.status !== 'accepted'
  )

  const filteredTransactions = merchantTransactions.filter(t => {
    if (filter === 'all') return true
    return t.status === filter
  })

  const totalEarnings = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.commission, 0)

  return (
    <div className="space-y-6">
      <div>
        <PromoBanner
          type="feature"
          message="📦 Export your earnings summary in one click!"
          link={{ href: '/merchant/history', label: 'View' }}
          storageKey="promo-merchant-transaction-history"
          className="mb-2"
        />
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Transaction History</h1>
        <p className="text-muted-foreground mt-1">
          View all your completed and cancelled exchanges
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalEarnings)}</p>
            <p className="text-xs text-muted-foreground">Total Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Cancelled
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          variant="transactions"
          title="No transactions found"
          description={filter === 'all' 
            ? "You haven't completed any exchanges yet" 
            : `No ${filter} transactions`
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      transaction.type === 'cash-to-online' 
                        ? 'bg-blue-500/10' 
                        : 'bg-orange-500/10'
                    }`}>
                      {transaction.type === 'cash-to-online' 
                        ? <ArrowUpRight className="w-5 h-5 text-blue-400" />
                        : <ArrowDownRight className="w-5 h-5 text-orange-400" />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                        <TransactionStatusBadge status={transaction.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {transaction.userName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <TransactionTypeBadge type={transaction.type} />
                    {transaction.status === 'completed' && (
                      <p className="text-sm font-medium text-primary">
                        +{formatCurrency(transaction.commission)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
