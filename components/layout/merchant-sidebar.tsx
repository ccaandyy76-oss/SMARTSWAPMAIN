'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Inbox, 
  Wallet,
  Clock, 
  Star,
  User, 
  LogOut,
  Menu,
  X,
  ArrowLeftRight,
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/app-context'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const merchantNavItems = [
  { href: '/merchant', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/merchant/requests', label: 'Incoming Requests', icon: Inbox, showBadge: true },
  { href: '/merchant/balance', label: 'Balance Management', icon: Wallet },
  { href: '/merchant/history', label: 'Transaction History', icon: Clock },
  { href: '/merchant/reviews', label: 'Ratings & Reviews', icon: Star },
  { href: '/merchant/profile', label: 'Profile / KYC', icon: User },
]

export function MerchantSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, transactions, currentMerchant, userRole, merchantPersonaActive, exitMerchantPersona } =
    useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  const pendingCount = transactions.filter(
    t => t.merchantId === currentMerchant?.id && t.status === 'pending'
  ).length

  return (
    <>
      {/* Mobile Header */}
      <div className="theme-surface lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-none backdrop-blur flex items-center justify-between px-4">
        <Link href="/merchant" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">
            <span className="text-primary">SMART</span>
            <span className="text-foreground">SWAP</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop top navigation */}
      <header className="theme-surface hidden lg:block sticky top-0 z-50 w-full border-b border-border bg-background/95 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-none backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-6">
            <Link href="/merchant" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-primary">SMART</span>
                <span className="text-foreground">SWAP</span>
              </span>
            </Link>

            <nav className="flex-1 min-w-0 flex items-center gap-2 justify-end">
              {merchantNavItems.slice(0, 3).map((item) => {
                const isActive = pathname === item.href
                const showPendingBadge = item.showBadge && pendingCount > 0
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      {item.label}
                      {showPendingBadge && (
                        <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5">
                          {pendingCount}
                        </Badge>
                      )}
                    </span>
                  </Link>
                )
              })}

              {merchantNavItems.slice(3).map((item) => {
                const isActive = pathname === item.href
                const showPendingBadge = item.showBadge && pendingCount > 0
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-colors hidden xl:inline-flex',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      {item.label}
                      {showPendingBadge && (
                        <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5">
                          {pendingCount}
                        </Badge>
                      )}
                    </span>
                  </Link>
                )
              })}

              {merchantNavItems.length > 3 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-colors text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground xl:hidden"
                    >
                      More <ChevronDown className="inline-block w-4 h-4 ml-1 -mr-0.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {merchantNavItems.slice(3).map((item) => {
                      const isActive = pathname === item.href
                      const showPendingBadge = item.showBadge && pendingCount > 0
                      return (
                        <DropdownMenuItem
                          key={item.href}
                          asChild
                          className={cn(isActive && 'bg-sidebar-primary text-sidebar-primary-foreground')}
                        >
                          <Link href={item.href}>
                            <span className="inline-flex items-center justify-between w-full gap-3">
                              <span>{item.label}</span>
                              {showPendingBadge && (
                                <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5">
                                  {pendingCount}
                                </Badge>
                              )}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>

            {/* Logout (far right) */}
            <div className="flex items-center gap-3 ml-2">
              {userRole === 'user' && merchantPersonaActive && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-primary/40 text-primary hover:bg-primary/10"
                  onClick={() => {
                    exitMerchantPersona()
                    router.push('/dashboard')
                  }}
                >
                  User view
                </Button>
              )}
              <div className="h-6 w-px bg-border hidden md:block" aria-hidden />
              <Button
                variant="ghost"
                onClick={() => {
                  logout()
                  window.location.href = '/'
                }}
                className="whitespace-nowrap px-2 text-muted-foreground hover:text-foreground"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300',
        'lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 border-b border-sidebar-border flex items-center px-4">
            <Link href="/merchant" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-primary">SMART</span>
                <span className="text-sidebar-foreground">SWAP</span>
              </span>
            </Link>
          </div>

          {/* Merchant Badge */}
          <div className="px-4 py-3 border-b border-sidebar-border">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Merchant Portal
            </Badge>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {merchantNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </div>
                  {item.showBadge && pendingCount > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5">
                      {pendingCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            {userRole === 'user' && merchantPersonaActive && (
              <Button
                type="button"
                variant="outline"
                className="w-full border-primary/40 text-primary hover:bg-primary/10"
                onClick={() => {
                  exitMerchantPersona()
                  router.push('/dashboard')
                  setMobileOpen(false)
                }}
              >
                User view
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                logout()
                window.location.href = '/'
              }}
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="theme-surface lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border bg-background/95 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)] backdrop-blur flex items-center justify-around px-2">
        {merchantNavItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              {item.showBadge && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
