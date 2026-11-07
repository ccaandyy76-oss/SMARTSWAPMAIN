import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from '@/components/ui/sonner'
import { AppProvider } from '@/context/app-context'
import { ThemeProvider } from '@/components/theme-provider'
import { IntroSplash } from '@/components/shared/intro-splash'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
})

export const metadata: Metadata = {
  title: 'SMARTSWAP - Peer-to-Peer Cash Exchange Platform',
  description: 'Exchange cash instantly with trusted merchants. No bank needed. Safe, fast, and reliable P2P cash exchange platform.',
  keywords: ['cash exchange', 'P2P', 'money transfer', 'instant exchange', 'trusted merchants'],
}

export const viewport: Viewport = {
  themeColor: '#0A0F1E',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} theme-surface font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <Script
          id="smartswap-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='smartswap-theme';var v=localStorage.getItem(k);var d=document.documentElement;if(v==='light'){d.classList.remove('dark');d.classList.add('light');}else{d.classList.remove('light');d.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="smartswap-theme">
          <AppProvider>
            <IntroSplash>{children}</IntroSplash>
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
