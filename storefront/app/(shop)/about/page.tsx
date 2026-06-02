import type { Metadata } from 'next';
import Link from 'next/link';
import { cmsApi } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = buildPageMetadata(
  'About Us',
  'Learn about Techno Tronics — Mauritius\'s premier electronics and gaming retailer.',
  '/about'
);

async function getAboutData() {
  try {
    const res = await cmsApi.getPage('about');
    return res.data.data || res.data;
  } catch {
    return null;
  }
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://technotronics.mu';

export default async function AboutPage() {
  const page = await getAboutData();
  const content = page?.content || [];

  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Techno Tronics Ltd',
    description: 'Premier electronics and gaming retailer in Mauritius.',
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MU',
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${siteUrl}/about` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white">About Us</span>
        </nav>

        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          {page?.title || 'About Techno Tronics'}
        </h1>

        {page?.subtitle && (
          <p className="mb-10 text-lg text-gray-600 dark:text-gray-400">{page.subtitle}</p>
        )}

        {content.length > 0 ? (
          <div className="space-y-10">
            {content.map((block: any, i: number) => {
              const type = block.type || '';
              const icons: Record<string, string> = {
                story: '📖', mission: '🎯', vision: '🔭', why: '⭐',
              };
              return (
                <section key={i} className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-start gap-4">
                    {icons[type] && (
                      <span className="text-3xl">{icons[type]}</span>
                    )}
                    <div className="flex-1">
                      {block.heading && (
                        <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{block.heading}</h2>
                      )}
                      {block.body && (
                        <div
                          className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300"
                          dangerouslySetInnerHTML={{ __html: block.body }}
                        />
                      )}
                      {block.text && (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{block.text}</p>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-8">
            {[
              { icon: '📖', title: 'Our Story', text: 'Techno Tronics was founded with a passion for bringing the latest technology to Mauritians. From humble beginnings to becoming the island\'s trusted electronics destination, we\'ve always put our customers first.' },
              { icon: '🎯', title: 'Our Mission', text: 'To provide authentic, high-quality electronics and gaming products at competitive prices, backed by expert advice and outstanding after-sales support.' },
              { icon: '🔭', title: 'Our Vision', text: 'To be the leading technology retailer in the Indian Ocean region, empowering every customer to live and work smarter through technology.' },
              { icon: '⭐', title: 'Why Choose Us', text: 'Genuine products, island-wide delivery, expert staff, and a showroom where you can try before you buy. We\'re not just a store — we\'re your tech partner.' },
            ].map(({ icon, title, text }) => (
              <section key={title} className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{text}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
