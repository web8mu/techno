import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://technotronics.mu';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout', '/cart', '/order-confirmation/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
