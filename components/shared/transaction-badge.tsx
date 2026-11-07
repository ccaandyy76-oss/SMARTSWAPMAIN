'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/mock-data'

interface TransactionTypeBadgeProps {
  type: Transaction['type']
  className?: string
}

export function TransactionTypeBadge({ type, className }: TransactionTypeBadgeProps) {
  return (
    <Badge 
      className={cn(
        'font-medium',
        type === 'cash-to-online' 
          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          : 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        className
      )}
    >
      {type === 'cash-to-online' ? 'Cash → Online' : 'Online → Cash'}
    </Badge>
  )
}

interface TransactionStatusBadgeProps {
  status: Transaction['status']
  className?: string
}

export function TransactionStatusBadge({ status, className }: TransactionStatusBadgeProps) {
  const statusConfig: Record<
    Transaction['status'],
    { label: string; className: string }
  > = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    accepted: {
      label: 'Accepted',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    otp_verified: {
      label: 'OTP verified',
      className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    payment_done: {
      label: 'Payment done',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    completed: {
      label: 'Completed',
      className: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    disputed: {
      label: 'Disputed',
      className: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
  }

  const config = statusConfig[status]

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
