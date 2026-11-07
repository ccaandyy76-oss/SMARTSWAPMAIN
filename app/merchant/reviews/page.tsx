'use client'

import { Star, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarRating, RatingBreakdown } from '@/components/shared/star-rating'
import { EmptyState } from '@/components/shared/empty-state'
import { PromoBanner } from '@/components/shared/promo-banner'
import { useApp } from '@/context/app-context'
import { mockReviews, formatDate } from '@/lib/mock-data'

export default function MerchantReviewsPage() {
  const { currentMerchant } = useApp()

  const merchantReviews = mockReviews.filter(r => r.merchantId === currentMerchant?.id)

  // Calculate rating breakdown
  const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  merchantReviews.forEach(r => {
    ratingCounts[r.rating]++
  })

  return (
    <div className="space-y-6">
      <div>
        <PromoBanner
          type="offer"
          message="🌟 Maintain a 4.5+ rating to get featured!"
          link={{ href: '/merchant/reviews', label: 'View' }}
          storageKey="promo-merchant-ratings-reviews"
          className="mb-2"
        />
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Ratings & Reviews</h1>
        <p className="text-muted-foreground mt-1">
          See what your customers say about you
        </p>
      </div>

      {/* Overall Rating */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:border-r md:border-border">
              <p className="text-6xl font-bold text-primary">
                {currentMerchant?.rating.toFixed(1)}
              </p>
              <div className="flex justify-center mt-2">
                <StarRating value={currentMerchant?.rating || 0} readonly size="lg" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on {currentMerchant?.totalRatings || 0} reviews
              </p>
            </div>

            {/* Rating Breakdown */}
            <div>
              <RatingBreakdown
                ratings={ratingCounts}
                totalRatings={merchantReviews.length}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {merchantReviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Complete exchanges to receive reviews from customers"
            />
          ) : (
            <div className="space-y-4">
              {merchantReviews.map((review) => (
                <div 
                  key={review.id}
                  className="p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{review.userName}</p>
                          <StarRating value={review.rating} readonly size="sm" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-3 ml-13">
                      &quot;{review.comment}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
