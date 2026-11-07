'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MerchantSidebar } from '@/components/layout/merchant-sidebar'
import { useApp } from '@/context/app-context'

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, userRole, authReady, currentUser, merchantPersonaActive } = useApp()

  useEffect(() => {
    if (!authReady) return
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
    if (userRole === 'admin') {
      router.replace('/admin')
      return
    }
    const allowMerchant =
      userRole === 'merchant' ||
      (userRole === 'user' &&
        merchantPersonaActive &&
        currentUser?.shopApplication?.status === 'approved')
    if (!allowMerchant) {
      if (userRole === 'user') {
        router.replace('/dashboard')
      } else {
        router.replace('/auth')
      }
    }
  }, [
    authReady,
    isAuthenticated,
    router,
    userRole,
    merchantPersonaActive,
    currentUser?.shopApplication?.status,
  ])

  return (
    <>
      {!authReady ? (
        <div className="theme-surface min-h-screen bg-background" />
      ) : (
        <div className="theme-surface min-h-screen bg-background">
          <MerchantSidebar />
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
