import Link from 'next/link'
import { ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HowItWorksSection } from '@/components/shared/how-it-works-section'

export default function StartPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold font-heading">
            <span className="text-primary">SMART</span>
            <span className="text-foreground">SWAP</span>
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-center">Get Started or Login</h1>
        <p className="text-muted-foreground text-center mt-2 max-w-sm text-sm">
          Create a user account or sign in to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-sm sm:max-w-md sm:justify-center">
          <Button size="lg" className="w-full sm:flex-1 bg-primary text-primary-foreground" asChild>
            <Link href="/auth?register=true&role=user">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:flex-1 border-primary/40" asChild>
            <Link href="/auth">Login</Link>
          </Button>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
          <HowItWorksSection />
        </div>
      </div>
    </div>
  )
}
