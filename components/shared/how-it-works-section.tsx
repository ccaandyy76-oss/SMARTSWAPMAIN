'use client'

import { CheckCircle, Users, ArrowRightLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  {
    stepLabel: 'Step 1',
    title: 'Find Merchant',
    description: 'Browse trusted merchants near you',
    icon: Users,
  },
  {
    stepLabel: 'Step 2',
    title: 'Exchange',
    description: 'Request cash or online money exchange',
    icon: ArrowRightLeft,
  },
  {
    stepLabel: 'Step 3',
    title: 'Done!',
    description: 'Complete with secure OTP verification',
    icon: CheckCircle,
  },
]

export function HowItWorksSection({ className }: { className?: string }) {
  return (
    <section className={className}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold font-heading mb-2">How It Works</h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
          Exchange cash in three simple steps. Safe, secure, and instant.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
        {steps.map((step) => (
          <Card key={step.stepLabel} className="bg-card/80 border-border relative overflow-hidden">
            <CardContent className="p-5 md:p-6 text-center">
              <span className="inline-block text-xs font-semibold text-primary mb-2 px-2 py-0.5 rounded-full bg-primary/10">
                {step.stepLabel}
              </span>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
