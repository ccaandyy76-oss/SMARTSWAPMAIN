'use client'

import { Star, Store } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StarRating } from '@/components/shared/star-rating'
import { EmptyState } from '@/components/shared/empty-state'
import { PromoBanner } from '@/components/shared/promo-banner'
import { useApp } from '@/context/app-context'
import { formatDate } from '@/lib/mock-data'

export default function ReviewsGivenPage() {
  const { currentUser, transactions } = useApp()

  const reviewedTransactions = transactions.filter(
    t => t.userId === currentUser?.id && t.rating
  )

  return (
    <div className="space-y-6">
      <div>
        <PromoBanner
          type="feature"
          message="⭐ Your review helps the community — keep sharing!"
          link={{ href: '/dashboard/reviews', label: 'View' }}
          storageKey="promo-user-reviews-given"
          className="mb-2"
        />
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Reviews Given</h1>
        <p className="text-muted-foreground mt-1">
          All the reviews you&apos;ve given to merchants
        </p>
      </div>

      {reviewedTransactions.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Complete an exchange and rate your experience to see your reviews here"
        />
      ) : (
        <div className="space-y-4">
          {reviewedTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{transaction.merchantName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.completedAt || transaction.createdAt)}
                        </p>
                      </div>
                      <StarRating value={transaction.rating || 0} readonly size="sm" />
                    </div>
                    {transaction.review && (
                      <p className="text-sm text-muted-foreground mt-2">
                        &quot;{transaction.review}&quot;
                      </p>
                    )}
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Transaction: ₹{transaction.amount.toLocaleString('en-IN')} • {transaction.type === 'cash-to-online' ? 'Cash → Online' : 'Online → Cash'}
                      </p>
                    </div>
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
