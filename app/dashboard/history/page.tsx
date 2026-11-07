'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TransactionTypeBadge, TransactionStatusBadge } from '@/components/shared/transaction-badge'
import { StarRating } from '@/components/shared/star-rating'
import { EmptyState } from '@/components/shared/empty-state'
import { PromoBanner } from '@/components/shared/promo-banner'
import { useApp } from '@/context/app-context'
import {
  formatCurrency,
  formatDateTime,
  isTransactionInFlight,
  type Transaction,
} from '@/lib/mock-data'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

type FilterStatus = 'all' | 'active' | 'completed' | 'failed'

export default function HistoryPage() {
  const { currentUser, transactions, rateTransaction } = useApp()

  const [filter, setFilter] = useState<FilterStatus>('all')
  const [ratingModal, setRatingModal] = useState<Transaction | null>(null)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [detail, setDetail] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350)
    return () => window.clearTimeout(t)
  }, [])

  const userTransactions = transactions.filter((t) => t.userId === currentUser?.id)

  const filteredTransactions = userTransactions.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'active') return isTransactionInFlight(t.status)
    if (filter === 'completed') return t.status === 'completed'
    if (filter === 'failed') return t.status === 'cancelled' || t.status === 'disputed'
    return true
  })

  const completedTx = userTransactions.filter((t) => t.status === 'completed')
  const lifetimeAmount = completedTx.reduce((s, t) => s + t.amount, 0)
  const activePipelineCount = userTransactions.filter((t) => isTransactionInFlight(t.status)).length

  const handleRate = (transaction: Transaction) => {
    setRatingModal(transaction)
    setRating(5)
    setReview('')
  }

  const handleSubmitRating = () => {
    if (!ratingModal) return

    rateTransaction(ratingModal.id, rating, review)
    setRatingModal(null)
    toast.success('Thank you for your rating!')
  }

  const statusBadge = (t: Transaction) => {
    if (filter === 'failed' && t.status === 'cancelled') {
      return (
        <Badge className="bg-destructive/15 text-destructive border-destructive/25">Failed</Badge>
      )
    }
    return <TransactionStatusBadge status={t.status} />
  }

  return (
    <div className="space-y-5">
      <div>
        <PromoBanner
          type="feature"
          message="Download a full statement anytime from support."
          link={{ href: '/dashboard/history', label: 'View' }}
          storageKey="promo-user-transaction-history"
          className="mb-2"
        />
        <h1 className="text-xl font-bold font-heading md:text-2xl">History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Statement-style view of your exchanges</p>
      </div>

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/25 via-[#1a1520] to-card shadow-lg shadow-black/30">
        <CardContent className="p-4 md:p-5">
          <p className="text-xs font-medium text-muted-foreground">Your activity</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold text-foreground">{userTransactions.length}</p>
              <p className="text-[10px] text-muted-foreground">Exchanges</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#10B981]">{formatCurrency(lifetimeAmount)}</p>
              <p className="text-[10px] text-muted-foreground">Total amount (completed)</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{activePipelineCount}</p>
              <p className="text-[10px] text-muted-foreground">In progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTx.length}</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Separator className="bg-border" />
        <h2 className="text-sm font-semibold font-heading text-muted-foreground">Transaction history</h2>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
        <TabsList className="bg-secondary w-full h-auto flex flex-wrap sm:inline-flex gap-1 p-1">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 sm:flex-none">
            All
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 sm:flex-none">
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 sm:flex-none">
            Completed
          </TabsTrigger>
          <TabsTrigger value="failed" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 sm:flex-none">
            Failed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          variant="transactions"
          title="No transactions found"
          description={
            filter === 'all' ? "You haven't made any exchanges yet" : `No ${filter} transactions`
          }
          action={{
            label: 'Start Exchange',
            onClick: () => (window.location.href = '/dashboard/exchange'),
          }}
        />
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div
                  role="button"
                  tabIndex={0}
                  className="w-full text-left cursor-pointer"
                  onClick={() => setDetail(transaction)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setDetail(transaction)
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          transaction.type === 'cash-to-online'
                            ? 'bg-blue-500/10'
                            : 'bg-orange-500/10'
                        }`}
                      >
                        {transaction.type === 'cash-to-online' ? (
                          <ArrowUpRight className="w-5 h-5 text-blue-400" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-orange-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-mono">{transaction.id}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                          {statusBadge(transaction)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{transaction.merchantName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(transaction.createdAt)}</p>
                        {transaction.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            <StarRating value={transaction.rating} readonly size="sm" />
                            <span className="text-xs text-muted-foreground">Your rating</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <TransactionTypeBadge type={transaction.type} />
                      <p className="text-xs text-muted-foreground">Fee: {formatCurrency(transaction.commission)}</p>
                    </div>
                  </div>
                </div>
                {transaction.status === 'completed' && !transaction.rating && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full border-primary text-primary hover:bg-primary/10"
                    onClick={() => handleRate(transaction)}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Rate
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction details</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">ID:</span> {detail.id}
              </p>
              <p>
                <span className="text-muted-foreground">Merchant:</span> {detail.merchantName}
              </p>
              <p>
                <span className="text-muted-foreground">Amount:</span> {formatCurrency(detail.amount)}
              </p>
              <p>
                <span className="text-muted-foreground">When:</span> {formatDateTime(detail.createdAt)}
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span> {detail.status}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!ratingModal} onOpenChange={() => setRatingModal(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                How was your exchange with {ratingModal?.merchantName}?
              </p>
              <div className="flex justify-center">
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Review (optional)</label>
              <Textarea
                placeholder="Share your experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                className="bg-secondary border-border resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingModal(null)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleSubmitRating} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
