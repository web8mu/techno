import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://technotronics.mu';
const siteName = 'Techno Tronics Ltd';

export function buildProductMetadata(product: any): Metadata {
  const title = product.seo_title || product.name;
  const description = product.seo_description || product.short_description || `Buy ${product.name} at the best price in Mauritius.`;
  const image = product.images?.[0]?.url;

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${product.slug}`,
      siteName,
      images: image ? [{ url: image, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export function buildPageMetadata(title: string, description: string, path = ''): Metadata {
  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      siteName,
      type: 'website',
    },
  };
}

export function buildProductJsonLd(product: any) {
  const price = product.sale_price || product.price;
  const image = product.images?.[0]?.url;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || '',
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || '',
    },
    image: image ? [image] : [],
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: 'MUR',
      price: parseFloat(price),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };
}
