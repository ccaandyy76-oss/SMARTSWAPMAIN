'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  showLogo?: boolean
  className?: string
}

export function LoadingSpinner({ size = 'md', showLogo = false, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <div className={cn(
          'absolute inset-0 rounded-full border-2 border-secondary',
          sizeClasses[size]
        )} />
        <div className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin',
          sizeClasses[size]
        )} />
      </div>
      {showLogo && (
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold font-heading text-primary">SMART</span>
          <span className="text-xl font-bold font-heading text-foreground">SWAP</span>
        </div>
      )}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <LoadingSpinner size="lg" showLogo />
    </div>
  )
}

export function CardLoader({ className }: { className?: string }) {
  return (
    <div className={cn(
      'flex items-center justify-center py-12',
      className
    )}>
      <LoadingSpinner size="md" />
    </div>
  )
}
