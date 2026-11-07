'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  }

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating)
    }
  }

  const handleMouseLeave = () => {
    setHoverValue(0)
  }

  const displayValue = hoverValue || value

  return (
    <div className={cn('flex items-center', gapClasses[size], className)}>
      {[1, 2, 3, 4, 5].map((rating) => {
        const isReadonly = readonly === true
        const Tag = isReadonly ? 'span' : 'button'

        return (
          <Tag
            key={rating}
            {...(!isReadonly && { type: 'button' as const })}
            onClick={!isReadonly ? () => handleClick(rating) : undefined}
            onMouseEnter={!isReadonly ? () => handleMouseEnter(rating) : undefined}
            onMouseLeave={!isReadonly ? handleMouseLeave : undefined}
            disabled={!isReadonly ? readonly : undefined}
            className={cn(
              'transition-transform',
              isReadonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'
            )}
            aria-label={`Rate ${rating} stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                rating <= displayValue
                  ? 'fill-primary text-primary'
                  : 'fill-none text-muted-foreground'
              )}
            />
          </Tag>
        )
      })}
      {showValue && (
        <span className="ml-1 font-medium">{value.toFixed(1)}</span>
      )}
    </div>
  )
}

interface RatingBreakdownProps {
  ratings: { [key: number]: number }
  totalRatings: number
  className?: string
}

export function RatingBreakdown({ ratings, totalRatings, className }: RatingBreakdownProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = ratings[star] || 0
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0

        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-3">{star}</span>
            <Star className="w-4 h-4 fill-primary text-primary" />
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
