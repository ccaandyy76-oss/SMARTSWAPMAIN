'use client'

import { useState } from 'react'
import { Store, Phone, Mail, MapPin, FileText, Upload, CheckCircle, Clock, XCircle, Percent } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/app-context'
import { formatDate } from '@/lib/mock-data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PromoBanner } from '@/components/shared/promo-banner'

export default function MerchantProfilePage() {
  const { currentMerchant } = useApp()
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    businessName: currentMerchant?.businessName || '',
    ownerName: currentMerchant?.ownerName || '',
    phone: currentMerchant?.phone || '',
    email: currentMerchant?.email || '',
    address: currentMerchant?.address || '',
  })

  const handleSave = () => {
    setIsEditing(false)
    toast.success('Profile updated successfully')
  }

  const kycStatusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle,
      className: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  }

  const kycConfig = kycStatusConfig[currentMerchant?.kycStatus || 'pending']
  const KycIcon = kycConfig.icon

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <PromoBanner
          type="alert"
          message="📋 Complete your KYC to increase your transaction limit!"
          link={{ href: '/merchant/profile', label: 'View' }}
          storageKey="promo-merchant-profile-kyc"
          className="mb-2"
        />
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Profile & KYC</h1>
        <p className="text-muted-foreground mt-1">
          Manage your business profile and verification
        </p>
      </div>

      {/* KYC Status Banner */}
      <Card className={cn('border', kycConfig.className.replace('bg-', 'border-').replace('/10', '/30'))}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', kycConfig.className.split(' ')[0])}>
            <KycIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">KYC Status</p>
              <Badge className={kycConfig.className}>{kycConfig.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentMerchant?.kycStatus === 'approved' && 'Your identity has been verified'}
              {currentMerchant?.kycStatus === 'pending' && 'Your documents are being reviewed'}
              {currentMerchant?.kycStatus === 'rejected' && 'Please resubmit your documents'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Business Details
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="border-border">
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="border-border">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Business Name
            </Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              disabled={!isEditing}
              className="bg-secondary border-border disabled:opacity-70"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              disabled={!isEditing}
              className="bg-secondary border-border disabled:opacity-70"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              disabled
              className="bg-secondary border-border opacity-70"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              placeholder="Add email address"
              className="bg-secondary border-border disabled:opacity-70"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Business Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              rows={3}
              className="bg-secondary border-border disabled:opacity-70 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Commission Rate */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Commission Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-primary/10">
            <p className="text-3xl font-bold text-primary">
              {currentMerchant?.commissionRate}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You earn this percentage on every completed exchange
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Commission rates are set by the platform. Contact support for rate adjustments.
          </p>
        </CardContent>
      </Card>

      {/* KYC Documents */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            KYC Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Aadhaar Card</span>
              </div>
              {currentMerchant?.kycStatus === 'approved' ? (
                <Badge className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Button variant="outline" size="sm" className="border-border">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              )}
            </div>

            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">PAN Card</span>
              </div>
              {currentMerchant?.kycStatus === 'approved' ? (
                <Badge className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Button variant="outline" size="sm" className="border-border">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Member since {currentMerchant?.memberSince ? formatDate(currentMerchant.memberSince) : 'N/A'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
