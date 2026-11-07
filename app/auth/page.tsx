'use client'

import { Suspense } from 'react'
import AuthFlow from '@/components/auth/auth-flow'
import { HowItWorksSection } from '@/components/shared/how-it-works-section'

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <div className="min-h-screen bg-background">
        <AuthFlow />
        <div className="border-t border-border bg-background">
          <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
            <HowItWorksSection />
          </div>
        </div>
      </div>
    </Suspense>
  )
}
