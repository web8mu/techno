import type { Metadata } from 'next';
import Link from 'next/link';
import { cmsApi } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = buildPageMetadata(
  'Our Services',
  'Explore the range of services offered by Techno Tronics — repairs, upgrades, delivery, and more.',
  '/services'
);

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://technotronics.mu';

const iconMap: Record<string, string> = {
  repair: '🔧', wrench: '🔧', tools: '🛠️', upgrade: '⚡', delivery: '🚚', truck: '🚚',
  support: '🎧', headphones: '🎧', gaming: '🎮', laptop: '💻', desktop: '🖥️',
  network: '📡', wifi: '📶', camera: '📷', phone: '📱', default: '💡',
};

function getIcon(iconName: string) {
  return iconMap[iconName?.toLowerCase()] || iconMap.default;
}

async function getServices() {
  try {
    const res = await cmsApi.getServices();
    return res.data.data || res.data || [];
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${siteUrl}/services` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white">Services</span>
        </nav>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Our Services</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Everything you need, from purchase to after-sales support.
          </p>
        </div>

        {services.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service: any, i: number) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-900/30">
                  {getIcon(service.icon)}
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{service.title || service.name}</h2>
                {service.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{service.description}</p>
                )}
                {service.price && (
                  <p className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400">{service.price}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '🔧', title: 'Repairs & Diagnostics', desc: 'Expert repairs for laptops, desktops, phones, and peripherals. Fast turnaround.' },
              { icon: '⚡', title: 'Upgrades', desc: 'RAM, SSD, GPU upgrades to breathe new life into your machine.' },
              { icon: '🚚', title: 'Island-wide Delivery', desc: 'Fast, reliable delivery to all districts of Mauritius and Rodrigues.' },
              { icon: '🎧', title: 'Technical Support', desc: 'Remote and on-site support for home and business users.' },
              { icon: '🖥️', title: 'Custom PC Builds', desc: 'We build your dream PC — gaming rigs, workstations, or budget builds.' },
              { icon: '📡', title: 'Network Setup', desc: 'Home and office network installation, Wi-Fi optimization, and security.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-900/30">
                  {icon}
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Need a service?</h2>
          <p className="mt-2 text-blue-100">Get in touch and we'll help you find the right solution.</p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
          >
            Contact Us <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
