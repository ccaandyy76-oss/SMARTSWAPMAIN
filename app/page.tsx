'use client'

import Link from 'next/link'
import { ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center max-w-md w-full space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <ArrowLeftRight className="w-8 h-8 text-primary-foreground" />
          </div>
          <span className="text-3xl font-bold font-heading">
            <span className="text-primary">SMART</span>
            <span className="text-foreground">SWAP</span>
          </span>
        </div>

        <p className="text-lg text-muted-foreground leading-relaxed">
          Exchange Cash Instantly, Safely and Smartly
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-center">
          <Button size="lg" className="w-full sm:w-auto min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base" asChild>
            <Link href="/auth?register=true&role=user">Get Started</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto min-w-[140px] h-12 text-base border-primary/50 hover:bg-primary/10"
            asChild
          >
            <Link href="/auth">Login</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Merchants can{' '}
          <Link href="/become-merchant" className="text-primary hover:underline">
            apply to join the network
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
