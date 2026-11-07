'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Smartphone, 
  ArrowRightLeft, 
  MapPin, 
  Send, 
  KeyRound, 
  CheckCircle,
  Store,
  Settings,
  Bell,
  Wallet,
  ArrowRight,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

interface HowItWorksStepItem {
  number: number
  title: string
  description: string
  icon: LucideIcon
}

function HowItWorksStepCard({ step }: { step: HowItWorksStepItem }) {
  const Icon = step.icon
  return (
    <article
      className="relative flex h-full flex-col rounded-2xl border border-primary/25 bg-gradient-to-br from-[#111827]/95 via-card/90 to-[#0A0F1E] p-5 shadow-lg shadow-black/30 ring-1 ring-white/[0.06] transition duration-300 hover:border-primary/45 hover:shadow-xl hover:shadow-primary/10 md:p-6"
    >
      <div className="mb-4 shrink-0">
        <span className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-bold tracking-wide text-primary-foreground shadow-md shadow-primary/25">
          Step {step.number}
        </span>
      </div>
      <div
        className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-inner ring-1 ring-primary/25"
        aria-hidden
      >
        <Icon className="h-7 w-7 shrink-0" />
      </div>
      <h3 className="mb-2 text-lg font-semibold font-heading leading-snug text-foreground md:text-xl">
        {step.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
    </article>
  )
}

function HowItWorksStepFlow({ steps }: { steps: HowItWorksStepItem[] }) {
  return (
    <>
      {/* Mobile / tablet: vertical stack + flow indicators */}
      <div className="flex flex-col lg:hidden">
        {steps.map((step, index) => (
          <div key={step.number}>
            <HowItWorksStepCard step={step} />
            {index < steps.length - 1 && (
              <div
                className="flex flex-col items-center gap-1 py-3"
                aria-hidden
              >
                <div className="h-6 w-px bg-gradient-to-b from-primary/50 via-border to-primary/50" />
                <ChevronDown className="h-5 w-5 text-primary/70" strokeWidth={2.5} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: 3-column grid, two rows, with mid-flow connector */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 gap-6">
          {steps.slice(0, 3).map((step) => (
            <HowItWorksStepCard key={step.number} step={step} />
          ))}
        </div>

        <div
          className="relative my-8 flex flex-col items-center justify-center gap-2"
          aria-hidden
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="relative flex flex-col items-center gap-1 rounded-full border border-primary/30 bg-[#0A0F1E] px-4 py-2 shadow-md shadow-black/40">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">
              Next phase
            </span>
            <ChevronDown className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {steps.slice(3, 6).map((step) => (
            <HowItWorksStepCard key={step.number} step={step} />
          ))}
        </div>
      </div>
    </>
  )
}

const userSteps: HowItWorksStepItem[] = [
  {
    number: 1,
    title: 'Login with OTP',
    description: 'Enter your phone number and verify with a one-time password. No complex passwords to remember.',
    icon: Smartphone,
  },
  {
    number: 2,
    title: 'Choose Exchange Type',
    description: 'Select whether you want to convert Cash to Online money or Online to Cash.',
    icon: ArrowRightLeft,
  },
  {
    number: 3,
    title: 'Find Nearby Merchant',
    description: 'Browse trusted merchants on the map near your location. Check ratings and availability.',
    icon: MapPin,
  },
  {
    number: 4,
    title: 'Send Request',
    description: 'Enter the amount and send a request to your chosen merchant. They\'ll respond in minutes.',
    icon: Send,
  },
  {
    number: 5,
    title: 'Meet & Verify with OTP',
    description: 'Meet the merchant and verify the exchange with a secure 6-digit OTP code.',
    icon: KeyRound,
  },
  {
    number: 6,
    title: 'Done!',
    description: 'Exchange complete! Rate your experience and help others find great merchants.',
    icon: CheckCircle,
  },
]

const merchantSteps: HowItWorksStepItem[] = [
  {
    number: 1,
    title: 'Register as Merchant',
    description: 'Sign up and complete KYC verification with your Aadhaar, PAN, and business documents.',
    icon: Store,
  },
  {
    number: 2,
    title: 'Set Up Your Profile',
    description: 'Add your business details, location, and set your commission rates.',
    icon: Settings,
  },
  {
    number: 3,
    title: 'Go Online',
    description: 'Toggle your status to online when you\'re available for exchanges.',
    icon: Bell,
  },
  {
    number: 4,
    title: 'Receive Requests',
    description: 'Get notified when users nearby want to exchange. Accept or decline based on your availability.',
    icon: Wallet,
  },
  {
    number: 5,
    title: 'Complete Exchange',
    description: 'Meet the user, verify their OTP, and complete the exchange securely.',
    icon: KeyRound,
  },
  {
    number: 6,
    title: 'Earn Commission',
    description: 'Earn commission on every successful exchange. Build your reputation with great service.',
    icon: CheckCircle,
  },
]

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState('user')

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <Header />
      
      <main>
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              How SMARTSWAP Works
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Whether you&apos;re a user looking to exchange cash or a merchant wanting to earn, 
              our platform makes it simple and secure.
            </p>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-12 pb-24">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12 bg-secondary">
                <TabsTrigger 
                  value="user" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  I&apos;m a User
                </TabsTrigger>
                <TabsTrigger 
                  value="merchant"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  I&apos;m a Merchant
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="mt-0">
                <HowItWorksStepFlow steps={userSteps} />

                <div className="text-center mt-12">
                  <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/auth">
                      Start Exchanging Now
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="merchant" className="mt-0">
                <HowItWorksStepFlow steps={merchantSteps} />

                <div className="text-center mt-12">
                  <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/become-merchant">
                      Apply to Become a Merchant
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
