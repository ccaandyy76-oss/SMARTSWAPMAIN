'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Store,
  Users,
  FileText, 
  BarChart3,
  LogOut,
  Menu,
  X,
  ArrowLeftRight,
  Shield
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/app-context'
import { pendingKYCApplications } from '@/lib/mock-data'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/merchants', label: 'Merchant Approval', icon: Store, showBadge: true },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/transactions', label: 'Transactions', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  const pendingCount = pendingKYCApplications.length

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-[#0A0F1E]/95 backdrop-blur flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
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

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300',
        'lg:translate-x-0 lg:static',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 border-b border-sidebar-border flex items-center px-4">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-primary">SMART</span>
                <span className="text-sidebar-foreground">SWAP</span>
              </span>
            </Link>
          </div>

          {/* Admin Badge */}
          <div className="px-4 py-3 border-b border-sidebar-border">
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
              <Shield className="w-3 h-3" />
              Admin Panel
            </Badge>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {adminNavItems.map((item) => {
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
                    <Badge className="bg-primary text-primary-foreground text-xs px-1.5">
                      {pendingCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border bg-[#0A0F1E]/95 backdrop-blur flex items-center justify-around px-2">
        {adminNavItems.map((item) => {
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
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
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
