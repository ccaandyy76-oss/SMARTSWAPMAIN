'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { useApp } from '@/context/app-context'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, userRole, authReady } = useApp()

  useEffect(() => {
    if (!authReady) return
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
    if (userRole === 'user') {
      router.replace('/dashboard')
      return
    }
    if (userRole === 'merchant') {
      router.replace('/merchant')
      return
    }
    if (userRole !== 'admin') router.replace('/auth')
  }, [authReady, isAuthenticated, router, userRole])

  return (
    <>
      {!authReady ? (
        <div className="min-h-screen bg-[#0A0F1E]" />
      ) : (
        <div className="min-h-screen bg-[#0A0F1E]">
          <AdminSidebar />
          <main className="min-h-screen pt-16 pb-20 md:pt-0 md:pb-0">
            <div className="p-4 md:px-6 md:pb-6 md:pt-0 lg:px-8 lg:pb-8 lg:pt-0">
              {children}
            </div>
          </main>
        </div>
      )}
    </>
  )
}

