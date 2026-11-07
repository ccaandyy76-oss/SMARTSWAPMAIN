'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useApp } from '@/context/app-context'
import type { ShopApplication, ShopCategory } from '@/lib/mock-data'
import { toast } from 'sonner'
import { MerchantsLeafletMap } from '@/components/dashboard/merchants-leaflet-map'

const CATEGORIES: { value: ShopCategory; label: string }[] = [
  { value: 'money-exchange', label: 'Money Exchange' },
  { value: 'general-store', label: 'General Store' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'medical', label: 'Medical' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'other', label: 'Other' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Draft = Omit<ShopApplication, 'id' | 'status' | 'submittedAt' | 'linkedMerchantId'>

const initialDraft = (): Draft => ({
  basic: {
    businessName: '',
    category: 'money-exchange',
    description: '',
    yearsInBusiness: '',
  },
  location: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    pinCode: '',
    latitude: 28.5706,
    longitude: 77.3219,
  },
  contact: {
    phone: '',
    email: '',
    whatsapp: '',
    openingTime: '09:00',
    closingTime: '21:00',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  owner: {
    fullName: '',
    aadhaar: '',
    pan: '',
    dateOfBirth: '',
    shopPhotoDataUrl: undefined,
    ownerPhotoDataUrl: undefined,
  },
  financial: {
    bankAccount: '',
    ifsc: '',
    accountHolderName: '',
    commissionCashToOnline: 1.5,
    commissionOnlineToCash: 1.5,
    maxExchange: 50000,
    minExchange: 100,
  },
})

export default function AddShopPage() {
  const { submitShopApplication } = useApp()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const [agree, setAgree] = useState(false)
  const [done, setDone] = useState(false)

  const setLoc = (lat: number, lng: number) => {
    setDraft((d) => ({
      ...d,
      location: { ...d.location, latitude: lat, longitude: lng },
    }))
  }

  const readFile = (file: File | undefined, cb: (url: string) => void) => {
    if (!file) return
    const r = new FileReader()
    r.onload = () => {
      if (typeof r.result === 'string') cb(r.result)
    }
    r.readAsDataURL(file)
  }

  const validatePin = (p: string) => /^\d{6}$/.test(p)

  const next = () => {
    if (step === 1 && !draft.basic.businessName.trim()) {
      toast.error('Shop name is required')
      return
    }
    if (step === 2) {
      if (!draft.location.line1.trim() || !draft.location.city.trim() || !draft.location.state.trim()) {
        toast.error('Fill required address fields')
        return
      }
      if (!validatePin(draft.location.pinCode)) {
        toast.error('PIN must be 6 digits')
        return
      }
    }
    if (step === 3 && !draft.contact.phone.trim()) {
      toast.error('Shop phone is required')
      return
    }
    if (step === 4) {
      if (
        !draft.owner.fullName.trim() ||
        !draft.owner.aadhaar.trim() ||
        !draft.owner.pan.trim() ||
        !draft.owner.dateOfBirth.trim()
      ) {
        toast.error('Fill owner required fields')
        return
      }
    }
    if (step === 5) {
      if (
        !draft.financial.bankAccount.trim() ||
        !draft.financial.ifsc.trim() ||
        !draft.financial.accountHolderName.trim()
      ) {
        toast.error('Fill bank details')
        return
      }
    }
    setStep((s) => Math.min(6, s + 1))
  }

  const back = () => setStep((s) => Math.max(1, s - 1))

  const handleSubmit = () => {
    if (!agree) {
      toast.error('Please confirm terms')
      return
    }
    submitShopApplication(draft)
    setDone(true)
    toast.success('Application submitted')
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-[#10B981]" />
        <h1 className="font-heading text-2xl font-bold">Application submitted!</h1>
        <p className="text-sm text-muted-foreground">
          Your shop is under review. We&apos;ll notify you within 24–48 hours once approved.
        </p>
        <Button className="bg-primary text-primary-foreground" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-8">
      <div>
        <h1 className="font-heading text-xl font-bold md:text-2xl">Register your shop</h1>
        <p className="mt-1 text-sm text-muted-foreground">Step {step} of 6</p>
      </div>

      {step === 1 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Basic information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Shop / business name</Label>
              <Input
                value={draft.basic.businessName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, basic: { ...d.basic, businessName: e.target.value } }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={draft.basic.category}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, basic: { ...d.basic, category: v as ShopCategory } }))
                }
              >
                <SelectTrigger className="border-border bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (max 200)</Label>
              <Textarea
                maxLength={200}
                value={draft.basic.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, basic: { ...d.basic, description: e.target.value } }))
                }
                className="border-border bg-secondary"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Years in business (optional)</Label>
              <Input
                value={draft.basic.yearsInBusiness}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, basic: { ...d.basic, yearsInBusiness: e.target.value } }))
                }
                className="border-border bg-secondary"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Address line 1</Label>
              <Input
                value={draft.location.line1}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    location: { ...d.location, line1: e.target.value },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Address line 2 (optional)</Label>
              <Input
                value={draft.location.line2}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    location: { ...d.location, line2: e.target.value },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={draft.location.city}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      location: { ...d.location, city: e.target.value },
                    }))
                  }
                  className="border-border bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={draft.location.state}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      location: { ...d.location, state: e.target.value },
                    }))
                  }
                  className="border-border bg-secondary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>PIN code</Label>
              <Input
                value={draft.location.pinCode}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    location: { ...d.location, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full border-border"
              onClick={() => {
                if (typeof navigator === 'undefined' || !navigator.geolocation) return
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setLoc(pos.coords.latitude, pos.coords.longitude)
                    toast.success('Location applied')
                  },
                  () => toast.error('Could not read location')
                )
              }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Use my current location
            </Button>
            <p className="text-xs text-muted-foreground">
              Pin: {draft.location.latitude.toFixed(5)}, {draft.location.longitude.toFixed(5)} — adjust by
              dragging isn&apos;t available; use GPS or edit defaults in code for fine-tuning.
            </p>
            <div className="relative h-48 overflow-hidden rounded-xl border border-border">
              <MerchantsLeafletMap
                merchants={[]}
                userLatLng={[draft.location.latitude, draft.location.longitude]}
                className="relative h-full w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Contact &amp; timings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Shop phone</Label>
              <Input
                value={draft.contact.phone}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    contact: { ...d.contact, phone: e.target.value },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Email (optional)</Label>
              <Input
                type="email"
                value={draft.contact.email}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    contact: { ...d.contact, email: e.target.value },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp (optional)</Label>
              <Input
                value={draft.contact.whatsapp}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    contact: { ...d.contact, whatsapp: e.target.value },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Opens</Label>
                <Input
                  type="time"
                  value={draft.contact.openingTime}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      contact: { ...d.contact, openingTime: e.target.value },
                    }))
                  }
                  className="border-border bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label>Closes</Label>
                <Input
                  type="time"
                  value={draft.contact.closingTime}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      contact: { ...d.contact, closingTime: e.target.value },
                    }))
                  }
                  className="border-border bg-secondary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Working days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <label key={day} className="flex items-center gap-1.5 text-xs">
                    <Checkbox
                      checked={draft.contact.workingDays.includes(day)}
                      onCheckedChange={(v) => {
                        setDraft((d) => {
                          const next =
                            v === true
                              ? [...d.contact.workingDays, day]
                              : d.contact.workingDays.filter((x) => x !== day)
                          return { ...d, contact: { ...d.contact, workingDays: next } }
                        })
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Owner &amp; verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Owner full name</Label>
              <Input
                value={draft.owner.fullName}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    owner: { ...d.owner, fullName: e.target.value },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Aadhaar number</Label>
              <Input
                value={draft.owner.aadhaar}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    owner: { ...d.owner, aadhaar: e.target.value },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>PAN</Label>
              <Input
                value={draft.owner.pan}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    owner: { ...d.owner, pan: e.target.value.toUpperCase() },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Date of birth</Label>
              <Input
                type="date"
                value={draft.owner.dateOfBirth}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    owner: { ...d.owner, dateOfBirth: e.target.value },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Shop front photo</Label>
              <Input
                type="file"
                accept="image/*"
                className="border-border bg-secondary"
                onChange={(e) =>
                  readFile(e.target.files?.[0], (url) =>
                    setDraft((d) => ({ ...d, owner: { ...d.owner, shopPhotoDataUrl: url } }))
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Owner photo / selfie</Label>
              <Input
                type="file"
                accept="image/*"
                className="border-border bg-secondary"
                onChange={(e) =>
                  readFile(e.target.files?.[0], (url) =>
                    setDraft((d) => ({ ...d, owner: { ...d.owner, ownerPhotoDataUrl: url } }))
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Financial &amp; commission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bank account number</Label>
              <Input
                value={draft.financial.bankAccount}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    financial: { ...d.financial, bankAccount: e.target.value },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>IFSC</Label>
              <Input
                value={draft.financial.ifsc}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    financial: { ...d.financial, ifsc: e.target.value.toUpperCase() },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Account holder name</Label>
              <Input
                value={draft.financial.accountHolderName}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    financial: { ...d.financial, accountHolderName: e.target.value },
                  }))
                }
                className="border-border bg-secondary"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Cash → Online %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={draft.financial.commissionCashToOnline}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      financial: {
                        ...d.financial,
                        commissionCashToOnline: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  className="border-border bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label>Online → Cash %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={draft.financial.commissionOnlineToCash}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      financial: {
                        ...d.financial,
                        commissionOnlineToCash: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  className="border-border bg-secondary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Min ₹ / txn</Label>
                <Input
                  type="number"
                  value={draft.financial.minExchange}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      financial: { ...d.financial, minExchange: Number(e.target.value) || 0 },
                    }))
                  }
                  className="border-border bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label>Max ₹ / txn</Label>
                <Input
                  type="number"
                  value={draft.financial.maxExchange}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      financial: { ...d.financial, maxExchange: Number(e.target.value) || 0 },
                    }))
                  }
                  className="border-border bg-secondary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 6 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Review &amp; submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <span className="text-muted-foreground">Shop:</span> {draft.basic.businessName}
            </p>
            <p>
              <span className="text-muted-foreground">Address:</span> {draft.location.line1},{' '}
              {draft.location.city}, {draft.location.state} {draft.location.pinCode}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span> {draft.contact.phone}
            </p>
            <p>
              <span className="text-muted-foreground">Owner:</span> {draft.owner.fullName}
            </p>
            <label className="flex items-start gap-2 pt-2">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} />
              <span>I confirm all details are correct and I agree to SmartSwap&apos;s Merchant Terms.</span>
            </label>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {step > 1 ? (
          <Button type="button" variant="outline" className="flex-1 border-border" onClick={back}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button type="button" variant="outline" className="flex-1 border-border" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
        )}
        {step < 6 ? (
          <Button type="button" className="flex-1 bg-primary text-primary-foreground" onClick={next}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" className="flex-1 bg-primary text-primary-foreground" onClick={handleSubmit}>
            Submit for approval
          </Button>
        )}
      </div>
    </div>
  )
}
