import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wheel-wise-roan.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/spin', '/room', '/wheels', '/wheel/create', '/auth'],
        disallow: ['/api/', '/auth/callback'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
