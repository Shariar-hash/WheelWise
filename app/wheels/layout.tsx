import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wheel-wise-roan.vercel.app'

export const metadata: Metadata = {
  title: 'Explore Custom Wheels - Browse & Spin Pre-made Wheels',
  description: 'Browse and spin pre-made random picker wheels created by the community. Find wheels for names, decisions, games, raffles, and more. Save and customize any wheel for free!',
  keywords: [
    'custom wheels',
    'pre-made picker wheels',
    'wheel templates',
    'random wheel collection',
    'community wheels',
    'name picker wheels',
    'decision wheels',
    'game wheels',
    'raffle wheels',
    'wheelwise collection',
  ],
  openGraph: {
    title: 'Explore Custom Wheels - Community Picker Wheels',
    description: 'Browse and spin pre-made random picker wheels created by the community!',
    url: `${siteUrl}/wheels`,
    images: ['/og-image.png'],
  },
  twitter: {
    title: 'Explore Custom Picker Wheels',
    description: 'Browse pre-made random picker wheels for names, decisions, games, and more!',
  },
  alternates: {
    canonical: `${siteUrl}/wheels`,
  },
}

export default function WheelsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
