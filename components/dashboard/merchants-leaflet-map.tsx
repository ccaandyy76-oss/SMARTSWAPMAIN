'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import type { Merchant } from '@/lib/mock-data'
import { loadLeafletCdn } from '@/lib/load-leaflet'
import { Skeleton } from '@/components/ui/skeleton'

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_DEFAULT = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

interface MerchantsLeafletMapProps {
  merchants: Merchant[]
  userLatLng: [number, number] | null
  className?: string
  /** When set, tapping a merchant marker selects them for exchange */
  onSelectMerchant?: (merchantId: string) => void
  /** Highlight this merchant on the map */
  selectedMerchantId?: string | null
}

export function MerchantsLeafletMap({
  merchants,
  userLatLng,
  className,
  onSelectMerchant,
  selectedMerchantId,
}: MerchantsLeafletMapProps) {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ remove: () => void; invalidateSize: () => void } | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        await loadLeafletCdn()
        if (cancelled || !containerRef.current) return
        // Global L from Leaflet CDN — use npm `leaflet` types in production if desired
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L as any
        if (!L || !containerRef.current) return

        const center: [number, number] = userLatLng ?? [28.5706, 77.3219]
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }

        const map = L.map(containerRef.current, {
          center,
          zoom: userLatLng ? 12 : 11,
          scrollWheelZoom: true,
        })

        const tileUrl = resolvedTheme === 'light' ? TILE_LIGHT : TILE_DEFAULT
        L.tileLayer(tileUrl, {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap &copy; CARTO',
        }).addTo(map)

        mapRef.current = map

        if (userLatLng) {
          L.circleMarker(userLatLng, {
            radius: 8,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.85,
          })
            .addTo(map)
            .bindPopup('Your location')
        }

        merchants.forEach((m) => {
          const isSel = selectedMerchantId === m.id
          const color = !m.isOnline ? '#6b7280' : isSel ? '#D97706' : '#F5A623'
          const mk = L.circleMarker([m.latitude, m.longitude], {
            radius: isSel ? 11 : 9,
            color,
            fillColor: color,
            fillOpacity: 0.9,
            weight: isSel ? 3 : 2,
          }).addTo(map)
          mk.bindPopup(
            `<strong>${m.businessName}</strong><br/>${m.isOnline ? 'Online' : 'Offline'} · ${m.rating}★${
              onSelectMerchant && m.isOnline
                ? '<br/><span style="font-size:11px;opacity:0.8">Tap marker to select</span>'
                : ''
            }`
          )
          mk.on('click', () => {
            if (onSelectMerchant && m.isOnline) onSelectMerchant(m.id)
          })
        })

        if (merchants.length) {
          const latlngs: [number, number][] = merchants.map((m) => [m.latitude, m.longitude])
          if (userLatLng) latlngs.push(userLatLng as [number, number])
          try {
            map.fitBounds(L.latLngBounds(latlngs).pad(0.15))
          } catch {
            map.setView(center, 11)
          }
        }

        setReady(true)
        setTimeout(() => map.invalidateSize(), 200)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Map failed to load')
      }
    }
    void run()
    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [merchants, userLatLng, onSelectMerchant, selectedMerchantId, resolvedTheme])

  return (
    <div className={className}>
      {!ready && !error && (
        <Skeleton className="absolute inset-0 z-[1] rounded-xl bg-secondary" />
      )}
      {error && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center rounded-xl bg-secondary text-sm text-muted-foreground p-4 text-center">
          {error}
        </div>
      )}
      <div ref={containerRef} className="h-full min-h-[280px] w-full rounded-xl z-0" />
    </div>
  )
}
