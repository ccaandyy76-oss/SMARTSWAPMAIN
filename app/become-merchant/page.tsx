'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { 
  IndianRupee, 
  Clock, 
  TrendingUp, 
  Shield,
  FileText,
  MapPin,
  Wallet,
  Upload,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { toast } from 'sonner'
import { OTPInput } from '@/components/shared/otp-input'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { cn } from '@/lib/utils'
import {
  normalizeContact,
  registerAccount,
  sendOtpChallenge,
  verifyOtpChallenge,
  type VerificationChannel,
  formatContactForMessage,
} from '@/lib/auth-storage'
import { getPasswordStrength, validatePassword } from '@/lib/password-utils'

const benefits = [
  {
    icon: IndianRupee,
    title: 'Commission Earnings',
    description: 'Earn 1.5% - 2.5% commission on every exchange. More exchanges, more earnings.',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'Work on your own schedule. Go online when available, offline when busy.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    description: 'Build a customer base in your area. Great service leads to repeat customers.',
  },
]

const requirements = [
  {
    icon: FileText,
    title: 'Aadhaar / PAN',
    description: 'Valid government ID for KYC verification',
  },
  {
    icon: MapPin,
    title: 'Business Address',
    description: 'Physical location where exchanges happen',
  },
  {
    icon: Wallet,
    title: 'Min ₹5,000 Balance',
    description: 'Maintain minimum cash and online balance',
  },
]

export default function BecomeMerchantPage() {
  const router = useRouter()
  const { login } = useApp()

  const [merchantStep, setMerchantStep] = useState<'identity' | 'otp' | 'password'>(
    'identity'
  )

  const [verificationMethod, setVerificationMethod] =
    useState<VerificationChannel>('phone')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const contactNormalized = useMemo(() => {
    if (verificationMethod === 'phone') return normalizeContact('phone', phone)
    return normalizeContact('email', email)
  }, [verificationMethod, phone, email])

  const contactLabel = useMemo(() => {
    if (!contactNormalized) return ''
    return formatContactForMessage(verificationMethod, contactNormalized)
  }, [verificationMethod, contactNormalized])

  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const strength = useMemo(() => getPasswordStrength(password), [password])

  useEffect(() => {
    if (merchantStep !== 'otp' || resendCooldown <= 0) return
    const t = window.setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearTimeout(t)
  }, [merchantStep, resendCooldown])

  const handleSendOtp = () => {
    if (!contactNormalized) {
      toast.error(
        verificationMethod === 'phone'
          ? 'Please enter a valid phone number'
          : 'Please enter a valid email address'
      )
      return
    }

    const { otpForDemo } = sendOtpChallenge(verificationMethod, contactNormalized)
    setOtp('')
    setResendCooldown(60)
    setMerchantStep('otp')

    toast.success('We sent a verification code to your email/phone')
    toast.info(`Demo OTP: ${otpForDemo}`)
  }

  const handleVerifyOtp = () => {
    if (otp.length !== 6) return
    if (!contactNormalized) return

    const res = verifyOtpChallenge(verificationMethod, contactNormalized, otp)
    if (!res.ok) {
      if (res.reason === 'expired') {
        toast.error('OTP has expired. Please request a new one.')
        setResendCooldown(0)
      } else {
        toast.error('Invalid OTP. Please try again.')
      }
      return
    }

    toast.success('OTP verified successfully')
    setMerchantStep('password')
  }

  const handleResendOtp = () => {
    if (resendCooldown > 0) return
    if (!contactNormalized) return

    const { otpForDemo } = sendOtpChallenge(verificationMethod, contactNormalized)
    setOtp('')
    setResendCooldown(60)
    toast.success(
      verificationMethod === 'phone'
        ? 'Verification code resent to your phone'
        : 'Verification code resent to your email'
    )
    toast.info(`Demo OTP: ${otpForDemo}`)
  }

  const handleCreateMerchantAccount = () => {
    if (!fullName.trim()) {
      toast.error('Please enter your full name.')
      return
    }
    if (!contactNormalized) {
      toast.error('Account contact is missing.')
      return
    }
    if (!businessName.trim()) {
      toast.error('Please enter your business name.')
      return
    }
    if (!address.trim()) {
      toast.error('Please enter your business address.')
      return
    }

    const pwValidation = validatePassword(password)
    if (!pwValidation.ok) {
      toast.error(
        'Password must be at least 8 characters and include uppercase, number, and special character.'
      )
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    try {
      const res = registerAccount({
        role: 'merchant',
        fullName: fullName.trim(),
        channel: verificationMethod,
        contact: contactNormalized,
        password,
      })

      login(res.account.role, {
        fullName: res.account.fullName,
        contact: contactNormalized,
        businessName: businessName.trim(),
      })

      toast.success('Merchant account created!')
      router.push('/merchant')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create account')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <Header />
      
      <main>
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Become a Trusted Merchant
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              Start Earning with SMARTSWAP
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Join our network of trusted merchants and earn commission on every cash exchange in your area.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-center mb-12">
              Why Become a Merchant?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-card border-border card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-12 bg-card/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-center mb-12">
              Requirements
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-start gap-4 p-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <req.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{req.title}</h3>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Apply Now</CardTitle>
                </CardHeader>
                <CardContent>
                  {merchantStep === 'identity' && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="merchant-fullName">Full Name</Label>
                        <Input
                          id="merchant-fullName"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="bg-secondary border-border"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary/80 p-1 ring-1 ring-border/60">
                        <button
                          type="button"
                          onClick={() => {
                            setVerificationMethod('phone')
                            setPhone('')
                          }}
                          className={cn(
                            'rounded-lg py-2.5 text-sm font-semibold transition-all duration-200',
                            verificationMethod === 'phone'
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                          aria-pressed={verificationMethod === 'phone'}
                        >
                          Phone Number
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVerificationMethod('email')
                            setEmail('')
                          }}
                          className={cn(
                            'rounded-lg py-2.5 text-sm font-semibold transition-all duration-200',
                            verificationMethod === 'email'
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                          aria-pressed={verificationMethod === 'email'}
                        >
                          Email Address
                        </button>
                      </div>

                      {verificationMethod === 'phone' ? (
                        <div className="space-y-2">
                          <Label htmlFor="merchant-phone">Phone Number</Label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 bg-secondary border border-r-0 border-border rounded-l-md text-muted-foreground text-sm">
                              +91
                            </span>
                            <Input
                              id="merchant-phone"
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel"
                              placeholder="98765 43210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              className="bg-secondary border-border rounded-l-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="merchant-email">Email Address</Label>
                          <Input
                            id="merchant-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-secondary border-border"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          placeholder="Your business or shop name"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          required
                          className="bg-secondary border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Textarea
                          id="address"
                          placeholder="Full address where exchanges will happen"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          rows={3}
                          className="bg-secondary border-border resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>KYC Documents</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload Aadhaar & PAN</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, JPG, or PNG up to 5MB each
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleSendOtp}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!contactNormalized || !fullName.trim()}
                      >
                        Send OTP
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        By continuing, you agree to our{' '}
                        <Link href="#" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  )}

                  {merchantStep === 'otp' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          We sent a verification code to your email/phone
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contactLabel ? `Code sent to ${contactLabel}` : 'Please check your inbox/SMS.'}
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <OTPInput value={otp} onChange={setOtp} onComplete={handleVerifyOtp} />
                      </div>

                      <div className="text-center">
                        {resendCooldown > 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Resend OTP in{' '}
                            <span className="text-primary font-medium">{resendCooldown}s</span>
                          </p>
                        ) : (
                          <Button variant="link" onClick={handleResendOtp} className="text-primary">
                            Resend OTP
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setMerchantStep('identity')
                            setOtp('')
                          }}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          onClick={handleVerifyOtp}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Verify
                        </Button>
                      </div>
                    </div>
                  )}

                  {merchantStep === 'password' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="merchant-create-password">Create Password</Label>
                        <div className="relative">
                          <Input
                            id="merchant-create-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-secondary border-border pr-10"
                            placeholder="At least 8 characters, uppercase, number, special character"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="merchant-confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="merchant-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-secondary border-border pr-10"
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                            aria-label="Toggle confirm password visibility"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Password strength</Label>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              strength.label === 'Weak'
                                ? 'bg-destructive'
                                : strength.label === 'Fair'
                                  ? 'bg-yellow-500'
                                  : strength.label === 'Good'
                                    ? 'bg-primary'
                                    : 'bg-[#10B981]'
                            )}
                            style={{ width: `${strength.percent}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Must be 8+ chars, include 1 uppercase, 1 number, and 1 special character.
                        </p>
                      </div>

                      <Button
                        onClick={handleCreateMerchantAccount}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!password || !confirmPassword}
                      >
                        Create Account
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
