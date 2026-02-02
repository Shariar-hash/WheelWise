import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Multiplayer Spin Rooms - Spin Wheels Together Live',
  description: 'Create or join live multiplayer spin rooms. Spin wheels together with friends in real-time. Perfect for group decisions, online raffles, and collaborative games. Free to use!',
  keywords: [
    'multiplayer wheel spinner',
    'live spin room',
    'group random picker',
    'collaborative wheel',
    'online raffle room',
    'spin wheel together',
    'live decision wheel',
    'group picker wheel',
    'real-time wheel spinner',
    'multiplayer random picker',
    'wheelwise rooms',
  ],
  openGraph: {
    title: 'Multiplayer Spin Rooms - Spin Together Live',
    description: 'Create or join live multiplayer spin rooms and spin wheels together with friends in real-time!',
    url: 'https://wheelwise.vercel.app/room',
    images: ['/og-image.png'],
  },
  twitter: {
    title: 'Multiplayer Spin Rooms - Spin Together',
    description: 'Spin wheels together with friends in real-time multiplayer rooms!',
  },
  alternates: {
    canonical: 'https://wheelwise.vercel.app/room',
  },
}

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
