'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function Html5QrScanner({ onScan }: { onScan: (text: string) => void }) {
  const [elId] = useState(() => `qr-${Math.random().toString(36).slice(2, 11)}`)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  useEffect(() => {
    const html5 = new Html5Qrcode(elId)
    html5
      .start(
        { facingMode: 'environment' },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          onScanRef.current(decoded)
        },
        () => {}
      )
      .catch(() => {})

    return () => {
      html5
        .stop()
        .then(() => html5.clear())
        .catch(() => {})
    }
  }, [elId])

  return <div id={elId} className="min-h-[220px] w-full overflow-hidden rounded-xl bg-black/30" />
}
