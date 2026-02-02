import '@/app/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { SocketProvider } from '@/components/providers/socket-provider'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/header'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = 'https://wheelwise.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'WheelWise - Free Random Picker Wheel | Spin the Wheel Online',
    template: '%s | WheelWise - Random Picker Wheel',
  },
  description: 'WheelWise is a free online random picker wheel and decision maker. Spin the wheel to pick random names, winners, or make decisions. Provably fair, multiplayer rooms, and fully customizable. The best random wheel spinner online!',
  keywords: [
    'random picker',
    'random picker wheel',
    'wheelwise',
    'wheel wise',
    'spin the wheel',
    'random wheel',
    'picker wheel',
    'wheel spinner',
    'random name picker',
    'random winner picker',
    'decision wheel',
    'spin wheel online',
    'random selector',
    'wheel of names',
    'random choice picker',
    'raffle wheel',
    'giveaway wheel',
    'prize wheel',
    'lucky wheel',
    'random number wheel',
    'yes no wheel',
    'decision maker',
    'random generator wheel',
    'spinning wheel',
    'fortune wheel',
    'free spinner wheel',
    'online wheel spinner',
    'multiplayer wheel',
    'provably fair wheel',
  ],
  authors: [{ name: 'WheelWise Team' }],
  creator: 'WheelWise',
  publisher: 'WheelWise',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/logo.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'WheelWise',
    title: 'WheelWise - Free Random Picker Wheel | Spin the Wheel Online',
    description: 'WheelWise is a free online random picker wheel and decision maker. Spin the wheel to pick random names, winners, or make decisions. Provably fair and fully customizable!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WheelWise - Random Picker Wheel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WheelWise - Free Random Picker Wheel',
    description: 'Spin the wheel to make random decisions! Free online random picker with multiplayer rooms and provably fair results.',
    images: ['/og-image.png'],
    creator: '@wheelwise',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
  verification: {
    google: '1477f49405386e8f',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // JSON-LD structured data for rich search results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'WheelWise',
    alternateName: ['Wheel Wise', 'WheelWise Random Picker', 'WheelWise Spinner'],
    description: 'Free online random picker wheel and decision maker. Spin the wheel to pick random names, winners, or make decisions with provably fair results.',
    url: 'https://wheelwise.vercel.app',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Random Picker Wheel',
      'Spin the Wheel',
      'Name Picker',
      'Winner Selector',
      'Decision Maker',
      'Multiplayer Rooms',
      'Provably Fair Algorithm',
      'Custom Wheel Themes',
      'Yes/No Wheel',
      'Raffle Wheel',
    ],
    screenshot: 'https://wheelwise.vercel.app/og-image.png',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SocketProvider>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Header />
                <main className="container mx-auto px-4 py-8">
                  {children}
                </main>
              </div>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                  },
                }}
              />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
