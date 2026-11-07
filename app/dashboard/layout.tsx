'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserDashboardShell } from '@/components/layout/user-dashboard-shell'
import { useApp } from '@/context/app-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, userRole, authReady } = useApp()

  useEffect(() => {
    if (!authReady) return
    if (!isAuthenticated) {
      router.replace('/auth')
      return
    }
    if (userRole === 'merchant') {
      router.replace('/merchant')
      return
    }
    if (userRole === 'admin') {
      router.replace('/admin')
      return
    }
    if (userRole !== 'user') {
      router.replace('/auth')
    }
  }, [authReady, isAuthenticated, router, userRole])

  if (!authReady) {
    return <div className="min-h-screen bg-background" />
  }

  if (!isAuthenticated || userRole !== 'user') {
    return <div className="min-h-screen bg-background" />
  }

  return <UserDashboardShell>{children}</UserDashboardShell>
}
