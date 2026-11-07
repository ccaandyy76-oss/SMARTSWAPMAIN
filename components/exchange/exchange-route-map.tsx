'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { loadLeafletCdn } from '@/lib/load-leaflet'
import { Skeleton } from '@/components/ui/skeleton'

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_DEFAULT = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

interface ExchangeRouteMapProps {
  userLatLng: [number, number]
  merchantLatLng: [number, number]
  merchantName: string
  className?: string
  onRouteMeta?: (d: { distanceKm: number; durationMin: number }) => void
}

export function ExchangeRouteMap({
  userLatLng,
  merchantLatLng,
  merchantName,
  className,
  onRouteMeta,
}: ExchangeRouteMapProps) {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ remove: () => void; invalidateSize: () => void } | null>(null)
  const metaCb = useRef(onRouteMeta)
  metaCb.current = onRouteMeta
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let invalidateTimer: ReturnType<typeof setTimeout> | null = null
    const run = async () => {
      try {
        await loadLeafletCdn()
        if (cancelled || !containerRef.current) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L as any
        if (!L) return

        const q = `https://router.project-osrm.org/route/v1/driving/${userLatLng[1]},${userLatLng[0]};${merchantLatLng[1]},${merchantLatLng[0]}?overview=full&geometries=geojson`
        const res = await fetch(q)
        const data = await res.json()
        if (cancelled || !containerRef.current) return
        const route = data?.routes?.[0]
        const coordsRaw: [number, number][] =
          route?.geometry?.coordinates?.map((c: number[]) => [c[1], c[0]]) ?? [
            userLatLng,
            merchantLatLng,
          ]

        const distanceKm = route ? route.distance / 1000 : 0
        const durationMin = route ? route.duration / 60 : 0
        metaCb.current?.({ distanceKm, durationMin })

        if (cancelled || !containerRef.current) return

        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }

        const map = L.map(containerRef.current, { scrollWheelZoom: true })
        const tileUrl = resolvedTheme === 'light' ? TILE_LIGHT : TILE_DEFAULT
        L.tileLayer(tileUrl, {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap &copy; CARTO',
        }).addTo(map)

        mapRef.current = map

        L.polyline(coordsRaw, { color: '#F5A623', weight: 5, opacity: 0.9 }).addTo(map)

        L.circleMarker(userLatLng, {
          radius: 8,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup('Your location')

        L.circleMarker(merchantLatLng, {
          radius: 9,
          color: '#F5A623',
          fillColor: '#F5A623',
          fillOpacity: 0.95,
        })
          .addTo(map)
          .bindPopup(`<strong>${merchantName}</strong>`)

        try {
          map.fitBounds(L.latLngBounds(coordsRaw).pad(0.12))
        } catch {
          map.setView(userLatLng, 13)
        }

        if (cancelled) {
          map.remove()
          mapRef.current = null
          return
        }

        setReady(true)
        invalidateTimer = setTimeout(() => {
          if (cancelled) return
          const m = mapRef.current
          if (m != null && typeof m.invalidateSize === 'function') {
            try {
              m.invalidateSize()
            } catch {
              // Map may already be torn down
            }
          }
        }, 200)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Route failed')
      }
    }
    void run()
    return () => {
      cancelled = true
      if (invalidateTimer !== null) {
        clearTimeout(invalidateTimer)
        invalidateTimer = null
      }
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [userLatLng, merchantLatLng, merchantName, resolvedTheme])

  return (
    <div className={className}>
      {!ready && !error && (
        <Skeleton className="absolute inset-0 z-[1] rounded-xl bg-secondary" />
      )}
      {error && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center rounded-xl bg-secondary p-4 text-center text-sm text-muted-foreground">
          {error}
        </div>
      )}
      <div ref={containerRef} className="h-full min-h-[260px] w-full rounded-xl z-0" />
    </div>
  )
}
