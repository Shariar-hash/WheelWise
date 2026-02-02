import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Random Picker Wheel - Spin to Pick Names & Winners',
  description: 'Free online random picker wheel to spin and choose random names, winners, or make decisions. Customizable wheel with yes/no options, name picker, raffle wheel, and more. 100% free and provably fair!',
  keywords: [
    'random picker',
    'random picker wheel', 
    'spin the wheel',
    'picker wheel',
    'random name picker',
    'name wheel',
    'random wheel spinner',
    'yes no wheel',
    'decision wheel',
    'raffle wheel',
    'giveaway wheel',
    'prize wheel spinner',
    'random selector wheel',
    'wheel of names',
    'random choice maker',
    'spin wheel online free',
    'random generator wheel',
    'lucky wheel spinner',
    'wheelwise spinner',
  ],
  openGraph: {
    title: 'Free Random Picker Wheel - Spin to Choose',
    description: 'Spin the wheel to pick random names, winners, or make decisions. Free online random picker with customizable options!',
    url: 'https://wheelwise.vercel.app/spin',
    images: ['/og-image.png'],
  },
  twitter: {
    title: 'Free Random Picker Wheel - Spin to Choose',
    description: 'Spin the wheel to pick random names and winners! Free online random picker.',
  },
  alternates: {
    canonical: 'https://wheelwise.vercel.app/spin',
  },
}

export default function SpinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
