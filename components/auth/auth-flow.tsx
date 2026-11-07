'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowLeftRight, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { OTPInput } from '@/components/shared/otp-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  findAccount,
  formatContactForMessage,
  normalizeContact,
  registerAccount,
  sendOtpChallenge,
  updatePassword,
  verifyOtpChallenge,
  type VerificationChannel,
} from '@/lib/auth-storage'
import { getPasswordStrength, validatePassword } from '@/lib/password-utils'
import { type AuthRole } from '@/lib/auth-token'
import { useApp } from '@/context/app-context'

type SignupStep = 'identity' | 'otp' | 'password'
type ForgotStep = 'contact' | 'otp' | 'newPassword'

export default function AuthFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useApp()

  const isRegister = searchParams.get('register') === 'true'
  const signupRole = (searchParams.get('role') as AuthRole | null) ?? null

  const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'signup'>(
    isRegister ? 'signup' : 'login'
  )
  const [signupStep, setSignupStep] = useState<SignupStep>('identity')
  const [forgotStep, setForgotStep] = useState<ForgotStep>('contact')

  const [verificationMethod, setVerificationMethod] =
    useState<VerificationChannel>('phone')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const contactNormalized = useMemo(() => {
    if (verificationMethod === 'phone') return normalizeContact('phone', phone)
    return normalizeContact('email', email)
  }, [verificationMethod, phone, email])

  const contactLabel = useMemo(() => {
    if (!contactNormalized) return ''
    return formatContactForMessage(verificationMethod, contactNormalized)
  }, [verificationMethod, contactNormalized])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [forgotChannel, setForgotChannel] = useState<VerificationChannel>('phone')
  const [forgotPhone, setForgotPhone] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')

  const forgotContactNormalized = useMemo(() => {
    if (forgotChannel === 'phone') return normalizeContact('phone', forgotPhone)
    return normalizeContact('email', forgotEmail)
  }, [forgotChannel, forgotPhone, forgotEmail])

  const forgotContactLabel = useMemo(() => {
    if (!forgotContactNormalized) return ''
    return formatContactForMessage(forgotChannel, forgotContactNormalized)
  }, [forgotChannel, forgotContactNormalized])

  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showForgotConfirm, setShowForgotConfirm] = useState(false)

  const validateAndToastPasswordIssues = (pw: string, confirm: string) => {
    if (!validatePassword(pw).ok) {
      toast.error(
        'Password must be at least 8 characters and include uppercase, number, and special character.'
      )
      return false
    }
    if (pw !== confirm) {
      toast.error('Passwords do not match.')
      return false
    }
    return true
  }

  const redirectByRole = (role: AuthRole | null) => {
    if (role === 'user') router.push('/dashboard')
    else if (role === 'merchant') router.push('/merchant')
    else if (role === 'admin') router.push('/admin')
    else toast.error('Role is missing. Please contact support.')
  }

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
    setSignupStep('otp')

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
    setSignupStep('password')
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

  const handleCreateAccount = () => {
    if (!signupRole) {
      toast.error('Role is missing. Please contact support.')
      return
    }
    if (!fullName.trim()) {
      toast.error('Please enter your full name.')
      return
    }
    if (!contactNormalized) {
      toast.error('Account contact is missing.')
      return
    }
    if (!validateAndToastPasswordIssues(password, confirmPassword)) return

    try {
      const res = registerAccount({
        role: signupRole,
        fullName: fullName.trim(),
        channel: verificationMethod,
        contact: contactNormalized,
        password,
      })

      login(res.account.role, {
        fullName: res.account.fullName,
        contact: contactNormalized,
        accountId: res.account.id,
        kycStatus: res.account.kycStatus,
        kycSkipped: res.account.kycSkipped,
      })

      if (res.account.role === 'user') {
        router.push('/auth/kyc')
        return
      }
      redirectByRole(res.account.role)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create account')
    }
  }

  const handleLogin = () => {
    if (!contactNormalized) {
      toast.error(
        verificationMethod === 'phone'
          ? 'Please enter a valid phone number'
          : 'Please enter a valid email address'
      )
      return
    }

    const account = findAccount(verificationMethod, contactNormalized)
    if (!account) {
      toast.error('Account not found. Please sign up first.')
      return
    }

    if (account.password !== loginPassword) {
      toast.error('Incorrect password. Try again or use Forgot Password.')
      return
    }

    login(account.role, {
      fullName: account.fullName,
      contact: contactNormalized,
      accountId: account.id,
      kycStatus: account.kycStatus,
      kycSkipped: account.kycSkipped,
    })

    redirectByRole(account.role)
  }

  const handleStartForgot = () => {
    setAuthMode('forgot')
    setForgotStep('contact')
    setForgotOtp('')
    setForgotNewPassword('')
    setForgotConfirmPassword('')
  }

  const handleForgotSendOtp = () => {
    if (!forgotContactNormalized) {
      toast.error(
        forgotChannel === 'phone'
          ? 'Please enter a valid phone number'
          : 'Please enter a valid email address'
      )
      return
    }

    const { otpForDemo } = sendOtpChallenge(forgotChannel, forgotContactNormalized)
    setForgotOtp('')
    setForgotStep('otp')

    toast.success('We sent a verification code to your email/phone')
    toast.info(`Demo OTP: ${otpForDemo}`)
  }

  const handleForgotVerifyOtp = () => {
    if (forgotOtp.length !== 6) return
    if (!forgotContactNormalized) return

    const res = verifyOtpChallenge(forgotChannel, forgotContactNormalized, forgotOtp)
    if (!res.ok) {
      if (res.reason === 'expired')
        toast.error('OTP has expired. Please request a new one.')
      else toast.error('Invalid OTP. Please try again.')
      return
    }

    toast.success('OTP verified successfully')
    setForgotStep('newPassword')
  }

  const handleForgotResetPassword = () => {
    if (!forgotContactNormalized) return

    if (!validatePassword(forgotNewPassword).ok) {
      toast.error(
        'Password must be at least 8 characters and include uppercase, number, and special character.'
      )
      return
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    try {
      const res = updatePassword({
        channel: forgotChannel,
        contact: forgotContactNormalized,
        newPassword: forgotNewPassword,
      })

      if (!res.ok) {
        toast.error('Account not found. Please sign up first.')
        setAuthMode('login')
        setForgotStep('contact')
        return
      }

      toast.success('Password updated. Please log in.')
      setAuthMode('login')
      setForgotStep('contact')
      router.push('/auth')
    } catch {
      toast.error('Failed to reset password. Please try again.')
    }
  }

  // Signup resend cooldown countdown
  useEffect(() => {
    if (authMode !== 'signup' || signupStep !== 'otp') return
    if (resendCooldown <= 0) return

    const t = window.setTimeout(() => {
      setResendCooldown((s) => Math.max(0, s - 1))
    }, 1000)

    return () => window.clearTimeout(t)
  }, [authMode, signupStep, resendCooldown])

  const title =
    authMode === 'signup'
      ? signupStep === 'identity'
        ? 'Create Account'
        : signupStep === 'otp'
          ? 'Verify OTP'
          : 'Create Password'
      : authMode === 'forgot'
        ? forgotStep === 'contact'
          ? 'Reset Password'
          : forgotStep === 'otp'
            ? 'Verify OTP'
            : 'Create New Password'
        : 'Welcome Back'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">
            <span className="text-primary">SMART</span>
            <span className="text-foreground">SWAP</span>
          </span>
        </Link>

        <Card className="bg-card border-border">
          <CardHeader className="text-center pb-2 space-y-2">
            <h1 className="text-2xl font-bold">{title}</h1>

            {authMode === 'signup' && signupStep === 'identity' && (
              <p className="text-sm text-muted-foreground">
                Enter your full name and{' '}
                {verificationMethod === 'phone'
                  ? 'phone number'
                  : 'email address'}{' '}
                to continue.
              </p>
            )}

            {authMode === 'signup' && signupStep === 'otp' && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  We sent a verification code to your email/phone
                </p>
                <p className="text-sm text-muted-foreground">
                  {contactLabel ? `Code sent to ${contactLabel}` : 'Please check your inbox/SMS.'}
                </p>
              </div>
            )}

            {authMode === 'signup' && signupStep === 'password' && (
              <p className="text-sm text-muted-foreground">
                Create a strong password to secure your account.
              </p>
            )}

            {authMode === 'login' && (
              <p className="text-sm text-muted-foreground">
                Log in with your email/phone and password.
              </p>
            )}

            {authMode === 'forgot' && forgotStep === 'contact' && (
              <p className="text-sm text-muted-foreground">
                Enter your email or phone number to reset your password.
              </p>
            )}

            {authMode === 'forgot' && forgotStep === 'otp' && (
              <p className="text-sm text-muted-foreground">
                We sent a verification code to your email/phone
              </p>
            )}

            {authMode === 'forgot' && forgotStep === 'newPassword' && (
              <p className="text-sm text-muted-foreground">Create your new password.</p>
            )}
          </CardHeader>

          <CardContent className="pt-4">
            {authMode === 'signup' && signupStep === 'identity' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullName">Full Name</Label>
                  <Input
                    id="signup-fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary/80 p-1 ring-1 ring-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationMethod('phone')
                      setPhone('')
                      setOtp('')
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
                      setOtp('')
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
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-secondary border border-r-0 border-border rounded-l-md text-muted-foreground text-sm shrink-0">
                        +91
                      </span>
                      <Input
                        id="signup-phone"
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
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
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

                <Button
                  onClick={handleSendOtp}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!contactNormalized}
                >
                  Send OTP
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By continuing, you agree to our{' '}
                  <Link href="#" className="text-primary hover:underline">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            )}

            {authMode === 'signup' && signupStep === 'otp' && (
              <div className="space-y-6">
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
                      setSignupStep('identity')
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

            {authMode === 'signup' && signupStep === 'password' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-password">Create Password</Label>
                  <div className="relative">
                    <Input
                      id="create-password"
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
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
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
                  onClick={handleCreateAccount}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!password || !confirmPassword}
                >
                  Create Account
                </Button>
              </div>
            )}

            {authMode === 'login' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary/80 p-1 ring-1 ring-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationMethod('phone')
                      setPhone('')
                      setLoginPassword('')
                    }}
                    className={cn(
                      'rounded-lg py-2.5 text-sm font-semibold transition-all duration-200',
                      verificationMethod === 'phone'
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-pressed={verificationMethod === 'phone'}
                  >
                    Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationMethod('email')
                      setEmail('')
                      setLoginPassword('')
                    }}
                    className={cn(
                      'rounded-lg py-2.5 text-sm font-semibold transition-all duration-200',
                      verificationMethod === 'email'
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-pressed={verificationMethod === 'email'}
                  >
                    Email
                  </button>
                </div>

                {verificationMethod === 'phone' ? (
                  <div className="space-y-2">
                    <Label htmlFor="login-phone">Phone Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-secondary border border-r-0 border-border rounded-l-md text-muted-foreground text-sm shrink-0">
                        +91
                      </span>
                      <Input
                        id="login-phone"
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
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
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
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-secondary border-border pr-10"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleStartForgot}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!contactNormalized || !loginPassword}
                >
                  Login
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  New here?{' '}
                  <Link href="/auth?register=true&role=user" className="text-primary hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            )}

            {authMode === 'forgot' && (
              <div className="space-y-4">
                {forgotStep === 'contact' && (
                  <>
                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary/80 p-1 ring-1 ring-border/60">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotChannel('phone')
                          setForgotPhone('')
                        }}
                        className={cn(
                          'rounded-lg py-2.5 text-sm font-semibold transition-all duration-200',
                          forgotChannel === 'phone'
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        aria-pressed={forgotChannel === 'phone'}
                      >
                        Phone
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotChannel('email')
                          setForgotEmail('')
                        }}
                        className={cn(
                          'rounded-lg py-2.5 text-sm font-semibold transition-all duration-200',
                          forgotChannel === 'email'
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        aria-pressed={forgotChannel === 'email'}
                      >
                        Email
                      </button>
                    </div>

                    {forgotChannel === 'phone' ? (
                      <div className="space-y-2">
                        <Label htmlFor="forgot-phone">Phone Number</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 bg-secondary border border-r-0 border-border rounded-l-md text-muted-foreground text-sm shrink-0">
                            +91
                          </span>
                          <Input
                            id="forgot-phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            placeholder="98765 43210"
                            value={forgotPhone}
                            onChange={(e) =>
                              setForgotPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                            }
                            className="bg-secondary border-border rounded-l-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email Address</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="bg-secondary border-border"
                        />
                      </div>
                    )}

                    <Button
                      onClick={handleForgotSendOtp}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={!forgotContactNormalized}
                    >
                      Send OTP
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Remembered your password?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login')
                          setForgotStep('contact')
                        }}
                        className="text-primary hover:underline"
                      >
                        Back to Login
                      </button>
                    </p>
                  </>
                )}

                {forgotStep === 'otp' && (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground text-center">
                      We sent a verification code to your{' '}
                      {forgotContactLabel || 'email/phone'}.
                    </p>
                    <div className="flex justify-center">
                      <OTPInput value={forgotOtp} onChange={setForgotOtp} onComplete={handleForgotVerifyOtp} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setForgotStep('contact')
                          setForgotOtp('')
                        }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handleForgotVerifyOtp}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                )}

                {forgotStep === 'newPassword' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-new-password">Create New Password</Label>
                      <div className="relative">
                        <Input
                          id="forgot-new-password"
                          type={showForgotPassword ? 'text' : 'password'}
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          className="bg-secondary border-border pr-10"
                          placeholder="Enter a new password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          aria-label="Toggle password visibility"
                        >
                          {showForgotPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="forgot-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="forgot-confirm-password"
                          type={showForgotConfirm ? 'text' : 'password'}
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          className="bg-secondary border-border pr-10"
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotConfirm((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showForgotConfirm ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleForgotResetPassword}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={!forgotNewPassword || !forgotConfirmPassword}
                    >
                      Reset Password
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Password requirements: min 8 chars, uppercase, number, and special character.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}

