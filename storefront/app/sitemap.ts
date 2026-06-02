import { MetadataRoute } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://technotronics.mu';

async function fetchJson(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsData, categoriesData, brandsData] = await Promise.all([
    fetchJson(`${API_BASE}/api/v1/products?per_page=500`),
    fetchJson(`${API_BASE}/api/v1/categories`),
    fetchJson(`${API_BASE}/api/v1/brands`),
  ]);

  const products: MetadataRoute.Sitemap = (productsData?.data?.data || []).map((p: any) => ({
    url: `${APP_URL}/products/${p.slug}`,
    lastModified: new Date(p.updated_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categories: MetadataRoute.Sitemap = (categoriesData?.data || []).map((c: any) => ({
    url: `${APP_URL}/shop?category=${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${APP_URL}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/services`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/auth/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${APP_URL}/auth/register`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  return [...staticPages, ...products, ...categories];
}
