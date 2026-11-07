'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeftRight,
  History,
  Home,
  MapPin,
  ArrowRightLeft,
  User,
  Bell,
  Store,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/app-context'
import { isTransactionInFlight } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'

const nav = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/exchange', label: 'Exchange', icon: ArrowRightLeft },
  { href: '/dashboard/merchants', label: 'Map', icon: MapPin },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export function UserDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, transactions, enterMerchantPersona } = useApp()

  const pendingCount = transactions.filter(
    (t) => t.userId === currentUser?.id && isTransactionInFlight(t.status)
  ).length

  const canSwitchToMerchant =
    currentUser?.shopApplication?.status === 'approved' &&
    !!currentUser.shopApplication.linkedMerchantId

  const initials = currentUser?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const firstName = currentUser?.name?.split(' ')[0] || 'User'

  return (
    <div className="theme-surface min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-none backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-lg md:max-w-3xl lg:max-w-5xl items-center gap-3 px-3 md:px-4">
          <Link href="/dashboard/profile" className="shrink-0">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={currentUser?.profilePhotoUrl || currentUser?.avatar} alt="" />
              <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex min-w-0 flex-1 flex-col items-center text-center leading-tight">
            <span className="flex items-center gap-1 text-sm font-bold md:hidden">
              <span className="text-primary">SMART</span>
              <span className="text-foreground">SWAP</span>
            </span>
            <span className="hidden text-sm font-medium text-foreground md:block">
              Hi, {firstName} <span aria-hidden>👋</span>
            </span>
            <span className="truncate text-[10px] text-muted-foreground md:hidden">Hi, {firstName}</span>
            {canSwitchToMerchant && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1 h-7 border-primary/40 px-2 text-[10px] text-primary hover:bg-primary/10"
                onClick={() => {
                  enterMerchantPersona()
                  router.push('/merchant')
                }}
              >
                <Store className="mr-1 h-3 w-3" />
                Merchant view
              </Button>
            )}
          </div>
          <button
            type="button"
            className="relative shrink-0 rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] border-0 bg-primary text-primary-foreground">
                {pendingCount > 9 ? '9+' : pendingCount}
              </Badge>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-3 pb-24 pt-16 md:max-w-3xl md:px-4 lg:max-w-5xl lg:pb-28 lg:px-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-stretch justify-around md:max-w-3xl lg:max-w-5xl">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-[3.5rem] flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-2xl transition-colors',
                    active ? 'bg-primary/15 text-primary' : 'bg-secondary/60 text-muted-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
