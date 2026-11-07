'use client'

import { Shield, MapPin, Star, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type Merchant, getBalanceLevel } from '@/lib/mock-data'

interface MerchantCardProps {
  merchant: Merchant
  distance?: number
  onRequestExchange?: () => void
  actionLabel?: string
  showBalance?: boolean
  className?: string
}

export function MerchantCard({
  merchant,
  distance,
  onRequestExchange,
  actionLabel = 'Request',
  showBalance = true,
  className,
}: MerchantCardProps) {
  const balanceLevel = getBalanceLevel(Math.min(merchant.cashBalance, merchant.onlineBalance))

  return (
    <Card className={cn(
      'bg-card border-border card-hover overflow-hidden',
      !merchant.isOnline && 'opacity-60',
      className
    )}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">
                {merchant.businessName}
              </h3>
              {merchant.isTrusted && (
                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 shrink-0">
                  <Zap className="w-3 h-3" />
                  Trusted
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {merchant.ownerName}
            </p>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-medium">{merchant.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({merchant.totalRatings})</span>
          </div>
        </div>

        {distance !== undefined && (
          <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`} away</span>
          </div>
        )}

        {showBalance && (
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-muted-foreground">Balance:</span>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'w-2 h-2 rounded-full',
                balanceLevel === 'high' && 'bg-[#10B981]',
                balanceLevel === 'medium' && 'bg-primary',
                balanceLevel === 'low' && 'bg-destructive'
              )} />
              <span className="text-xs capitalize">{balanceLevel}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              merchant.isOnline ? 'bg-[#10B981]' : 'bg-muted-foreground'
            )} />
            <span className="text-xs text-muted-foreground">
              {merchant.isOnline ? 'Online' : 'Offline'}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {merchant.commissionRate}% commission
            </span>
          </div>
          
          {onRequestExchange && (
            <Button 
              size="sm" 
              onClick={onRequestExchange}
              disabled={!merchant.isOnline}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface TrustedMerchantCardProps {
  merchant: Merchant
  className?: string
}

export function TrustedMerchantCard({ merchant, className }: TrustedMerchantCardProps) {
  return (
    <Card className={cn(
      'bg-card border-border card-hover min-w-[280px] sm:min-w-[320px]',
      className
    )}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {merchant.businessName}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              <span className="text-sm font-medium">{merchant.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">• {merchant.totalRatings} reviews</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 mt-4 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{merchant.address}</span>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
            <Zap className="w-3 h-3" />
            Trusted Merchant
          </Badge>
          <span className="text-sm text-muted-foreground">
            {merchant.commissionRate}% fee
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
