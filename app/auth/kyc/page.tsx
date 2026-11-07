'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowLeftRight,
  BadgeCheck,
  Car,
  CreditCard,
  FileText,
  Fingerprint,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OTPInput } from '@/components/shared/otp-input'
import { useApp } from '@/context/app-context'
import {
  applyKycVerified,
  findAccountById,
  sendOtpChallenge,
  skipKycForAccount,
  verifyOtpChallenge,
} from '@/lib/auth-storage'
import { isValidIndianMobile, normalizeIndianPhone } from '@/lib/auth-contact'
import type { KycDocumentType } from '@/lib/kyc-types'
import { isValidAadhaarNumber, isValidPanNumber, normalizePan } from '@/lib/kyc-validation'
import { cn } from '@/lib/utils'

type Phase =
  | 'intro'
  | 'aadhaar'
  | 'aadhaar-otp'
  | 'pan'
  | 'dl'
  | 'passport'
  | 'success'

const docCards: {
  id: KycDocumentType
  title: string
  icon: typeof Fingerprint
  recommended?: boolean
}[] = [
  { id: 'aadhaar', title: 'Aadhaar Card', icon: Fingerprint, recommended: true },
  { id: 'pan', title: 'PAN Card', icon: CreditCard },
  { id: 'dl', title: 'Driving License', icon: Car },
  { id: 'passport', title: 'Passport', icon: FileText },
]

export default function KycPage() {
  const router = useRouter()
  const { isAuthenticated, userRole, currentUser, authReady, refreshUserFromStorage } = useApp()

  const [phase, setPhase] = useState<Phase>('intro')
  const [doc, setDoc] = useState<KycDocumentType | null>(null)
  const [aadhaar, setAadhaar] = useState('')
  const [aadhaarOtp, setAadhaarOtp] = useState('')
  const [pan, setPan] = useState('')
  const [panName, setPanName] = useState('')
  const [panDob, setPanDob] = useState('')
  const [dlNum, setDlNum] = useState('')
  const [dlDob, setDlDob] = useState('')
  const [dlState, setDlState] = useState('')
  const [passNum, setPassNum] = useState('')
  const [passDob, setPassDob] = useState('')
  const [passExpiry, setPassExpiry] = useState('')
  const [busy, setBusy] = useState(false)
  const [verifiedName, setVerifiedName] = useState('')

  const accountId = currentUser?.accountId

  const account = useMemo(
    () => (accountId ? findAccountById(accountId) : null),
    [accountId]
  )

  useEffect(() => {
    if (!authReady) return
    if (!isAuthenticated || userRole !== 'user') {
      router.replace('/auth')
      return
    }
    if (account?.kycStatus === 'verified') {
      router.replace('/dashboard')
    }
  }, [authReady, isAuthenticated, userRole, router, account?.kycStatus])

  const phone10 =
    account?.phone ??
    (currentUser?.phone && isValidIndianMobile(normalizeIndianPhone(currentUser.phone))
      ? normalizeIndianPhone(currentUser.phone)
      : '')

  const finishSuccess = (type: KycDocumentType, display: string, masked?: string) => {
    if (!accountId) return
    applyKycVerified(accountId, {
      documentType: type,
      verifiedAt: Date.now(),
      displayLabel: display,
      maskedRef: masked,
    })
    refreshUserFromStorage()
    setVerifiedName(account?.fullName ?? currentUser?.name ?? 'User')
    setPhase('success')
    toast.success('KYC verified')
  }

  const handleSkip = () => {
    if (!accountId) return
    skipKycForAccount(accountId)
    refreshUserFromStorage()
    toast.message('You can complete KYC anytime from your profile.')
    router.push('/dashboard')
  }

  const onAadhaarSendOtp = () => {
    const digits = aadhaar.replace(/\s/g, '')
    if (!isValidAadhaarNumber(digits)) {
      toast.error('Enter a valid 12-digit Aadhaar number')
      return
    }
    if (!phone10) {
      toast.error('Link a phone number on your account to receive OTP (demo: use signup with phone).')
      return
    }
    /* Integrate: UIDAI Aadhaar OTP API / licensed KYC provider — OTP gated on Aadhaar-linked mobile */
    const { otpForDemo } = sendOtpChallenge('phone', phone10)
    setAadhaarOtp('')
    setPhase('aadhaar-otp')
    toast.success('OTP sent to your registered mobile (demo)')
    toast.info(`Demo OTP: ${otpForDemo}`)
  }

  const onAadhaarVerifyOtp = () => {
    if (aadhaarOtp.length !== 6 || !phone10) return
    const res = verifyOtpChallenge('phone', phone10, aadhaarOtp)
    if (!res.ok) {
      toast.error(res.reason === 'expired' ? 'OTP expired' : 'Invalid OTP')
      return
    }
    const last4 = aadhaar.replace(/\s/g, '').slice(-4)
    finishSuccess('aadhaar', 'Aadhaar Card', `XXXX XXXX ${last4}`)
  }

  const onVerifyPan = async () => {
    const p = normalizePan(pan)
    if (!isValidPanNumber(p)) {
      toast.error('Invalid PAN format (e.g. ABCDE1234F)')
      return
    }
    if (!panName.trim() || !panDob) {
      toast.error('Enter full name and date of birth as on PAN')
      return
    }
    setBusy(true)
    /* Integrate: NSDL / Protean PAN verification API */
    await new Promise((r) => setTimeout(r, 900))
    setBusy(false)
    finishSuccess('pan', 'PAN Card', `${p.slice(0, 2)}XXXXX${p.slice(7)}`)
  }

  const onVerifyDl = async () => {
    if (!dlNum.trim() || !dlDob || !dlState.trim()) {
      toast.error('Fill all fields')
      return
    }
    setBusy(true)
    /* Integrate: state transport / KYC provider driving license API */
    await new Promise((r) => setTimeout(r, 900))
    setBusy(false)
    finishSuccess('dl', 'Driving License', dlNum.slice(-4).padStart(dlNum.length, '•'))
  }

  const onVerifyPassport = async () => {
    if (!passNum.trim() || !passDob || !passExpiry) {
      toast.error('Fill all fields')
      return
    }
    setBusy(true)
    /* Integrate: passport verification service */
    await new Promise((r) => setTimeout(r, 900))
    setBusy(false)
    finishSuccess('passport', 'Passport', passNum.slice(-4).padStart(passNum.length, '•'))
  }

  if (!authReady || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-4 pb-20">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">
            <span className="text-primary">SMART</span>
            <span className="text-foreground">SWAP</span>
          </span>
        </Link>

        <Card className="bg-card border-border">
          <CardHeader className="text-center space-y-1 pb-2">
            {phase === 'intro' && (
              <>
                <h1 className="text-2xl font-bold">Verify Your Identity</h1>
                <p className="text-sm text-muted-foreground">
                  Complete KYC to start exchanging cash securely on SmartSwap
                </p>
              </>
            )}
            {phase === 'aadhaar' && (
              <>
                <h1 className="text-2xl font-bold">Aadhaar verification</h1>
                <p className="text-xs text-muted-foreground">
                  {/* Production: UIDAI OTP API / certified KYC partner */}
                  Integrate with UIDAI Aadhaar OTP API or a licensed KYC provider for production verification.
                </p>
              </>
            )}
            {phase === 'aadhaar-otp' && (
              <>
                <h1 className="text-2xl font-bold">Enter OTP</h1>
                <p className="text-sm text-muted-foreground">Code sent to your Aadhaar-linked mobile (demo)</p>
              </>
            )}
            {phase === 'pan' && <h1 className="text-2xl font-bold">PAN verification</h1>}
            {phase === 'dl' && <h1 className="text-2xl font-bold">Driving license</h1>}
            {phase === 'passport' && <h1 className="text-2xl font-bold">Passport</h1>}
            {phase === 'success' && (
              <>
                <div className="flex justify-center">
                  <BadgeCheck className="w-14 h-14 text-[#10B981]" />
                </div>
                <h1 className="text-2xl font-bold">KYC Verified Successfully ✓</h1>
                <p className="text-sm text-muted-foreground">
                  Name from document: <span className="text-foreground font-medium">{verifiedName}</span>
                </p>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {phase === 'intro' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docCards.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setDoc(c.id)
                        if (c.id === 'aadhaar') setPhase('aadhaar')
                        else if (c.id === 'pan') setPhase('pan')
                        else if (c.id === 'dl') setPhase('dl')
                        else setPhase('passport')
                      }}
                      className={cn(
                        'rounded-xl border p-4 text-left transition hover:border-primary/60 hover:bg-primary/5',
                        c.recommended ? 'border-primary ring-1 ring-primary/30 bg-primary/5' : 'border-border'
                      )}
                    >
                      {c.recommended && (
                        <span className="mb-2 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Recommended
                        </span>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <c.icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{c.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={handleSkip}>
                  Skip for Now
                </Button>
              </>
            )}

            {phase === 'aadhaar' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar number</Label>
                  <Input
                    id="aadhaar"
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="12-digit Aadhaar"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="bg-secondary border-border"
                  />
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={onAadhaarSendOtp}>
                  Send OTP
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setPhase('intro')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </>
            )}

            {phase === 'aadhaar-otp' && (
              <>
                <OTPInput value={aadhaarOtp} onChange={setAadhaarOtp} onComplete={onAadhaarVerifyOtp} />
                <Button className="w-full bg-primary text-primary-foreground" onClick={onAadhaarVerifyOtp}>
                  Verify
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setPhase('aadhaar')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </>
            )}

            {phase === 'pan' && (
              <>
                <div className="space-y-2">
                  <Label>PAN number</Label>
                  <Input
                    className="bg-secondary border-border uppercase"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Full name (as on PAN)</Label>
                  <Input
                    className="bg-secondary border-border"
                    value={panName}
                    onChange={(e) => setPanName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of birth</Label>
                  <Input
                    type="date"
                    className="bg-secondary border-border"
                    value={panDob}
                    onChange={(e) => setPanDob(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {/* Production: NSDL PAN verification */}
                  Integrate with NSDL / Protean PAN verification API for live checks.
                </p>
                <Button className="w-full bg-primary text-primary-foreground" disabled={busy} onClick={onVerifyPan}>
                  {busy ? 'Verifying…' : 'Verify PAN'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setPhase('intro')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </>
            )}

            {phase === 'dl' && (
              <>
                <div className="space-y-2">
                  <Label>License number</Label>
                  <Input className="bg-secondary border-border" value={dlNum} onChange={(e) => setDlNum(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date of birth</Label>
                  <Input type="date" className="bg-secondary border-border" value={dlDob} onChange={(e) => setDlDob(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>State of issue</Label>
                  <Input className="bg-secondary border-border" value={dlState} onChange={(e) => setDlState(e.target.value)} />
                </div>
                <Button className="w-full bg-primary text-primary-foreground" disabled={busy} onClick={onVerifyDl}>
                  {busy ? 'Verifying…' : 'Verify License'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setPhase('intro')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </>
            )}

            {phase === 'passport' && (
              <>
                <div className="space-y-2">
                  <Label>Passport number</Label>
                  <Input className="bg-secondary border-border" value={passNum} onChange={(e) => setPassNum(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date of birth</Label>
                  <Input type="date" className="bg-secondary border-border" value={passDob} onChange={(e) => setPassDob(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Expiry date</Label>
                  <Input type="date" className="bg-secondary border-border" value={passExpiry} onChange={(e) => setPassExpiry(e.target.value)} />
                </div>
                <Button className="w-full bg-primary text-primary-foreground" disabled={busy} onClick={onVerifyPassport}>
                  {busy ? 'Verifying…' : 'Verify Passport'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setPhase('intro')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </>
            )}

            {phase === 'success' && (
              <Button className="w-full bg-primary text-primary-foreground" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
