'use client'

import { useEffect, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'

const SESSION_KEY = 'smartswap_intro_played'

export function IntroSplash({ children }: { children: React.ReactNode }) {
  const [splash, setSplash] = useState(false)
  const [typed, setTyped] = useState('')
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return
    if (sessionStorage.getItem(SESSION_KEY) === '1') return
    setSplash(true)
  }, [])

  useEffect(() => {
    if (!splash) return
    const label = 'SMARTSWAP'
    let i = 0
    const interval = window.setInterval(() => {
      i += 1
      setTyped(label.slice(0, i))
      if (i >= label.length) window.clearInterval(interval)
    }, 75)

    const end = window.setTimeout(() => {
      setExiting(true)
      window.setTimeout(() => {
        sessionStorage.setItem(SESSION_KEY, '1')
        setSplash(false)
      }, 450)
    }, 2600)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(end)
    }
  }, [splash])

  return (
    <>
      {splash && (
        <div
          className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050810] transition-opacity duration-500 ${
            exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-live="polite"
        >
          <div className="mb-6 flex h-20 w-20 scale-100 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 motion-safe:animate-[scale-in_0.7s_ease-out]"
            style={{ animation: 'none' }}
          >
            <ArrowLeftRight className="h-10 w-10 text-primary-foreground motion-safe:animate-[fade-slow_0.8s_ease-out]" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-primary">{typed.slice(0, 5)}</span>
            <span className="text-foreground">{typed.slice(5)}</span>
            {typed.length < 9 && (
              <span className="inline-block w-0.5 h-8 ml-1 bg-primary align-middle animate-pulse" aria-hidden />
            )}
          </h1>
          <p
            className={`mt-5 max-w-sm text-center text-sm text-muted-foreground transition-opacity duration-700 ${
              typed.length >= 5 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Peer-to-Peer Cash Exchange
          </p>
        </div>
      )}
      {children}
    </>
  )
}
