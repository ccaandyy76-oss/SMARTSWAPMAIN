'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PromoBannerType = 'offer' | 'feature' | 'alert'

export function PromoBanner({
  type,
  message,
  link,
  dismissible = true,
  storageKey,
  className,
}: {
  type: PromoBannerType
  message: string
  link?: { href: string; label: string }
  dismissible?: boolean
  storageKey?: string
  className?: string
}) {
  const defaultStorageKey = useMemo(() => {
    // Keep the key short and stable across refreshes.
    const base = `${type}:${message}`
    return `promo-banner:${encodeURIComponent(base).slice(0, 120)}`
  }, [type, message])

  const key = storageKey ?? defaultStorageKey

  const [isDismissed, setIsDismissed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!dismissible) return
    if (typeof window === 'undefined') return

    try {
      const v = window.localStorage.getItem(key)
      if (v === '1') setIsDismissed(true)
    } catch {
      // Ignore localStorage issues (private mode, blocked storage, etc).
    }
  }, [dismissible, key])

  if (isDismissed) return null

  const theme = (() => {
    switch (type) {
      case 'offer':
        return {
          icon: '🎉',
          container:
            'light:bg-[#DCFCE7] light:border-[#86EFAC] light:text-[#15803D] light:hover:border-[#4ADE80] bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981] hover:border-[#10B981]/30',
          iconBg: 'light:bg-[#BBF7D0] bg-[#10B981]/15',
        }
      case 'feature':
        return {
          icon: '🚀',
          container:
            'light:bg-[#DBEAFE] light:border-[#93C5FD] light:text-[#1D4ED8] light:hover:border-[#60A5FA] bg-blue-500/10 border-blue-500/20 text-blue-400 hover:border-blue-500/30',
          iconBg: 'light:bg-[#BFDBFE] bg-blue-500/15',
        }
      case 'alert':
        return {
          icon: '⚠️',
          container:
            'light:bg-[#FEE2E2] light:border-[#FCA5A5] light:text-[#B91C1C] light:hover:border-[#F87171] bg-destructive/10 border-destructive/20 text-destructive hover:border-destructive/30',
          iconBg: 'light:bg-[#FECACA] bg-destructive/15',
        }
      default:
        return {
          icon: '📣',
          container: 'bg-secondary/50 border-border text-foreground',
          iconBg: 'bg-secondary',
        }
    }
  })()

  const dismiss = () => {
    if (!dismissible) return
    setIsClosing(true)

    // Hide after the animation completes.
    window.setTimeout(() => {
      setIsDismissed(true)
      try {
        window.localStorage.setItem(key, '1')
      } catch {
        // Ignore localStorage issues.
      }
    }, 220)
  }

  return (
    <div
      className={cn(
        'relative w-full rounded-xl border px-4 py-3',
        'transition-all duration-300 ease-out',
        theme.container,
        isClosing
          ? 'opacity-0 -translate-y-1'
          : isMounted
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2',
        className
      )}
      role={dismissible ? 'status' : undefined}
      aria-live="polite"
    >
      {dismissible && (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'rounded-md p-1 text-current/70 hover:text-current hover:bg-black/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70'
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-3 pr-8 sm:pr-10">
        <div
          className={cn(
            'mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border',
            'border-white/10',
            theme.iconBg
          )}
          aria-hidden
        >
          <span className="text-lg leading-none">{theme.icon}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-[15px] font-semibold leading-relaxed">
            {message}
          </p>
        </div>

        {link && (
          <div className="shrink-0 pt-0.5">
            <Link
              href={link.href}
              className={cn(
                'inline-flex items-center rounded-lg border px-3 py-2 text-xs font-semibold',
                'bg-transparent hover:bg-black/10',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70'
              )}
            >
              {link.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

