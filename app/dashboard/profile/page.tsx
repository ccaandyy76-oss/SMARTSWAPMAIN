'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  Phone,
  Mail,
  Shield,
  HelpCircle,
  Gift,
  Sun,
  Moon,
  LogOut,
  Copy,
  Share2,
  BadgeCheck,
  Smartphone,
  MessageCircle,
  Flag,
  BookOpen,
  ChevronRight,
  Star,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useApp } from '@/context/app-context'
import { formatCurrency, formatDate } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const { currentUser, logout, setUserTwoFactor, setUserProfilePhoto } = useApp()

  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  })

  useEffect(() => {
    setMounted(true)
    if (currentUser) {
      setFormData({ name: currentUser.name, email: currentUser.email || '' })
    }
  }, [currentUser])

  const initials = currentUser?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const kyc = currentUser?.kycStatus
  const kycVerified = kyc === 'verified'

  const handleSave = () => {
    setIsEditing(false)
    toast.success('Profile updated (demo — not persisted to server)')
  }

  const handleCopyReferral = () => {
    const code = currentUser?.referralCode ?? 'SW-DEMO'
    void navigator.clipboard.writeText(code)
    toast.success('Referral code copied')
  }

  const handleShare = () => {
    const code = currentUser?.referralCode ?? 'SW-DEMO'
    if (navigator.share) {
      void navigator.share({ title: 'SmartSwap', text: `Join me on SmartSwap! Use code ${code}` })
    } else {
      handleCopyReferral()
    }
  }

  const handleLogoutAll = () => {
    toast.success('Other sessions ended (demo)')
  }

  const confirmLogout = () => {
    logout()
    router.push('/')
  }

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setUserProfilePhoto(url)
    toast.success('Photo updated')
  }

  const kycLabel =
    kycVerified ? 'Verified ✓' : kyc === 'pending' ? 'Pending' : kyc === 'failed' ? 'Failed' : 'Not started'

  return (
    <div className="space-y-5 pb-8 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-bold font-heading md:text-2xl">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Account, KYC, security, and preferences</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage src={currentUser?.profilePhotoUrl || currentUser?.avatar} />
            <AvatarFallback className="bg-primary/15 text-primary text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold truncate">{currentUser?.name}</h2>
              {kycVerified && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-medium text-[#10B981]">
                  <BadgeCheck className="h-3 w-3" /> KYC
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{currentUser?.phone}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile photo</Label>
            <Input type="file" accept="image/*" className="text-xs" onChange={onPhotoChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Full name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              Phone
            </Label>
            <Input value={currentUser?.phone || ''} disabled className="bg-secondary/60 border-border opacity-80" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className="bg-secondary border-border"
            />
          </div>
          {!isEditing ? (
            <Button variant="outline" className="w-full border-border" onClick={() => setIsEditing(true)}>
              Edit profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-border" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleSave}>
                Save
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-primary" />
            KYC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
            <span className="text-sm">Status</span>
            <span className="text-sm font-medium">{kycLabel}</span>
          </div>
          {kycVerified && currentUser?.kyc && (
            <p className="text-xs text-muted-foreground">
              {currentUser.kyc.displayLabel}
              {currentUser.kyc.maskedRef ? ` · ${currentUser.kyc.maskedRef}` : ''} · Verified{' '}
              {formatDate(new Date(currentUser.kyc.verifiedAt).toISOString().slice(0, 10))}
            </p>
          )}
          {!kycVerified && (
            <Button className="w-full bg-primary text-primary-foreground" asChild>
              <Link href="/auth/kyc">Complete KYC</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Privacy & security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-between border-border"
            onClick={() => toast.message('Connect password change to your API (demo)')}
          >
            Change password
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">Extra protection for withdrawals (demo toggle)</p>
            </div>
            <Switch
              checked={!!currentUser?.twoFactorEnabled}
              onCheckedChange={(c) => {
                setUserTwoFactor(c)
                toast.success(c ? '2FA enabled (demo)' : '2FA disabled (demo)')
              }}
            />
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Active sessions
            </p>
            <ul className="space-y-2">
              {(currentUser?.activeSessions ?? []).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-xs"
                >
                  <span className={s.current ? 'text-primary font-medium' : ''}>
                    {s.label}
                    {s.current ? ' · This device' : ''}
                  </span>
                  {!s.current && (
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground">
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10" onClick={handleLogoutAll}>
            Log out of all devices
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Help & support
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button variant="outline" className="justify-between border-border" asChild>
            <Link href="/how-it-works">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> FAQ & how it works
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="justify-between border-border" asChild>
            <Link href="/dashboard/reviews">
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4" /> Reviews you gave
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="justify-between border-border" onClick={() => toast.message('support@smartswap.com')}>
            <span className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Contact support
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="justify-between border-border" onClick={() => toast.message('Thanks — we will review (demo)')}>
            <span className="flex items-center gap-2">
              <Flag className="h-4 w-4" /> Report a problem
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            Refer & earn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Your code</p>
            <p className="text-xl font-bold font-mono tracking-wider">{currentUser?.referralCode ?? 'SW-XXXXXX'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-border" onClick={handleCopyReferral}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {currentUser?.referralsCount ?? 0} friends joined · {formatCurrency(currentUser?.referralRewards ?? 0)} rewards
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            {mounted && resolvedTheme === 'dark' ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : (
              <Sun className="h-4 w-4 text-primary" />
            )}
            Appearance
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Currently using:{' '}
            <span className="font-medium text-foreground">
              {mounted ? (resolvedTheme === 'dark' ? 'Dark' : 'Light') : '…'}
            </span>
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!mounted}
            onClick={() => setTheme('dark')}
            className={cn(
              'theme-surface flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-left transition-colors',
              mounted && resolvedTheme === 'dark'
                ? 'border-primary bg-secondary/80'
                : 'border-border bg-secondary/40 hover:bg-secondary/60'
            )}
          >
            <div className="flex h-14 w-full items-center justify-center rounded-lg bg-[#0A0F1E]">
              <Moon className="h-6 w-6 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Dark mode</span>
          </button>
          <button
            type="button"
            disabled={!mounted}
            onClick={() => setTheme('light')}
            className={cn(
              'theme-surface flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-left transition-colors',
              mounted && resolvedTheme === 'light'
                ? 'border-primary bg-secondary/80'
                : 'border-border bg-secondary/40 hover:bg-secondary/60'
            )}
          >
            <div className="flex h-14 w-full items-center justify-center rounded-lg bg-[#F5F5F5] border border-[#DEDEDE]">
              <Sun className="h-6 w-6 text-[#D97706]" />
            </div>
            <span className="text-sm font-medium text-foreground">Light mode</span>
          </button>
        </CardContent>
      </Card>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={confirmLogout}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
