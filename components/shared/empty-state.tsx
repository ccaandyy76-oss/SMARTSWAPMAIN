'use client'

import { type ReactNode } from 'react'
import { 
  Inbox, 
  Search, 
  FileText, 
  Users, 
  ShoppingBag,
  Bell,
  type LucideIcon 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type EmptyStateVariant = 'default' | 'search' | 'transactions' | 'users' | 'merchants' | 'notifications'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
  className?: string
}

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: Inbox,
  search: Search,
  transactions: FileText,
  users: Users,
  merchants: ShoppingBag,
  notifications: Bell,
}

export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  children,
  className,
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant]

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <Button 
          onClick={action.onClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}
