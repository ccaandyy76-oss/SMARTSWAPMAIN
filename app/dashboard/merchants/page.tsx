'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { List, Map, MapPin, Search, Filter } from 'lucide-react'
import { MerchantsLeafletMap } from '@/components/dashboard/merchants-leaflet-map'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { MerchantCard } from '@/components/shared/merchant-card'
import { PromoBanner } from '@/components/shared/promo-banner'
import { useApp } from '@/context/app-context'
import { Skeleton } from '@/components/ui/skeleton'

export default function MerchantsPage() {
  const router = useRouter()
  const { merchants } = useApp()

  const [view, setView] = useState<'map' | 'list'>('map')
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'commission'>('distance')
  const [query, setQuery] = useState('')
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setListLoading(false), 400)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => {
          setUserPos(null)
        },
        { timeout: 8000 }
      )
    }
    return () => window.clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = merchants
    if (q) {
      list = list.filter(
        (m) =>
          m.businessName.toLowerCase().includes(q) ||
          m.address.toLowerCase().includes(q) ||
          m.ownerName.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'commission') return a.commissionRate - b.commissionRate
      return 0
    })
  }, [merchants, query, sortBy])

  const handleRequestExchange = (merchantId: string) => {
    router.push(`/dashboard/exchange?merchant=${merchantId}`)
  }

  return (
    <div className="space-y-5">
      <div>
        <PromoBanner
          type="feature"
          message="Verified merchants near you — compare ratings and distance."
          link={{ href: '/dashboard/merchants', label: 'View' }}
          storageKey="promo-user-nearby-merchants"
          className="mb-2"
        />
        <h1 className="text-xl font-bold font-heading md:text-2xl">Nearby merchants</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Map and list — search by name or area</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search merchant or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-secondary border-border pl-9"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as 'map' | 'list')}>
          <TabsList className="bg-secondary h-10">
            <TabsTrigger value="map" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
              <Map className="w-3.5 h-3.5 mr-1.5" />
              Map view
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
              <List className="w-3.5 h-3.5 mr-1.5" />
              List view
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[150px] h-9 bg-secondary border-border text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="commission">Commission</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {view === 'map' && (
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-[320px] md:h-[420px]">
              <MerchantsLeafletMap merchants={filtered} userLatLng={userPos} className="relative h-full w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Merchants</h2>
        {listLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          filtered.map((merchant, index) => (
            <MerchantCard
              key={merchant.id}
              merchant={merchant}
              distance={0.3 + index * 0.4}
              onRequestExchange={() => handleRequestExchange(merchant.id)}
            />
          ))
        )}
        {!listLoading && filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No merchants match your search.</p>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {merchants.filter((m) => m.isOnline).length} online
            </span>
            <span>{merchants.filter((m) => !m.isOnline).length} offline</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
