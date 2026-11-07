/**
 * Loads Leaflet from CDN (avoids local npm install issues on some Windows setups).
 * Production: prefer `leaflet` npm package + bundler.
 */
export function loadLeafletCdn(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  const w = window as Window & { __smartswapLeafletLoaded?: boolean; L?: unknown }
  if (w.__smartswapLeafletLoaded && w.L) return Promise.resolve()

  if (!document.querySelector('link[href*="leaflet.css"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.crossOrigin = ''
    document.head.appendChild(link)
  }

  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="leaflet.js"]')) {
      const check = () => {
        if ((window as Window & { L?: unknown }).L) {
          w.__smartswapLeafletLoaded = true
          resolve()
        } else setTimeout(check, 50)
      }
      check()
      return
    }
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    s.async = true
    s.crossOrigin = ''
    s.onload = () => {
      w.__smartswapLeafletLoaded = true
      resolve()
    }
    s.onerror = () => reject(new Error('Failed to load Leaflet'))
    document.body.appendChild(s)
  })
}
