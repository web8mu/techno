import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Gamepad2, Zap, Shield, Truck } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { HeroSlider } from '@/components/HeroSlider';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { catalogApi, cmsApi } from '@/lib/api';

async function getData() {
  try {
    const [productsRes, categoriesRes, brandsRes] = await Promise.allSettled([
      catalogApi.getProducts({ per_page: 8, sort: 'latest' }),
      catalogApi.getCategories(),
      catalogApi.getBrands(),
    ]);

    const bestSellerRes = await catalogApi.getProducts({ per_page: 8, sort: 'best_selling' }).catch(() => null);
    const homepageRes = await cmsApi.getHomepageData().catch(() => null);

    return {
      latestProducts: productsRes.status === 'fulfilled' ? (productsRes.value.data.data || []) : [],
      bestSellers: bestSellerRes?.data?.data || [],
      categories: categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data.data || []) : [],
      brands: brandsRes.status === 'fulfilled' ? (brandsRes.value.data.data || []) : [],
      homepageData: homepageRes?.data?.data || homepageRes?.data || null,
    };
  } catch {
    return { latestProducts: [], bestSellers: [], categories: [], brands: [], homepageData: null };
  }
}

const categoryIcons: Record<string, string> = {
  Laptops: '💻',
  Desktops: '🖥️',
  Components: '⚙️',
  Gaming: '🎮',
  Accessories: '🖱️',
  Monitors: '🖥️',
  Networking: '📡',
  Storage: '💾',
};

const features = [
  { icon: Zap, title: 'Fast Delivery', desc: 'Same-day delivery in Port Louis' },
  { icon: Shield, title: 'Genuine Products', desc: '100% authentic electronics with warranty' },
  { icon: Truck, title: 'Store Pickup', desc: 'Collect from our showroom anytime' },
];

const defaultHeroSlides = [
  {
    title: 'Power Your World with Premium Tech',
    subtitle: 'Discover the latest laptops, gaming rigs, components, and accessories. Authentic products, expert advice, island-wide delivery.',
    button_text: 'Shop Now',
    button_url: '/shop',
    background_image_path: '',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={s <= rating ? 'text-amber-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const { latestProducts, bestSellers, categories, brands, homepageData } = await getData();

  const slides = homepageData?.hero_slides?.length > 0 ? homepageData.hero_slides : defaultHeroSlides;
  const sections = homepageData?.sections || {};
  const testimonials: any[] = homepageData?.testimonials || [];

  const gamingTitle = sections.gaming_banner_title || 'Gaming World';
  const gamingSubtitle = sections.gaming_banner_subtitle || 'A dedicated gaming universe is coming — gear, peripherals, builds, and more.';
  const gamingCta = sections.gaming_banner_cta || 'Learn More';

  const showTestimonials = sections.show_testimonials === '1' && testimonials.length > 0;
  const showNewsletter = sections.show_newsletter !== '0';
  const showLatest = sections.show_latest !== '0';
  const showBestSellers = sections.show_best_sellers !== '0';
  const showCategories = sections.show_categories !== '0';
  const showBrands = sections.show_brands !== '0';
  const showGamingBanner = sections.show_gaming_banner !== '0';

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Slider */}
      <HeroSlider slides={slides} />

      {/* Features strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {showCategories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
            <Link href="/shop" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
              All Categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((cat: any) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="text-3xl">
                  {cat.icon || categoryIcons[cat.name] || '📦'}
                </span>
                {cat.image && (
                  <div className="relative h-12 w-12">
                    <Image src={cat.image} alt={cat.name} fill sizes="48px" className="object-contain" />
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Products */}
      {showLatest && latestProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Arrivals</h2>
            <Link href="/shop?sort=latest" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={latestProducts} />
        </section>
      )}

      {/* Best Sellers */}
      {showBestSellers && bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Best Sellers</h2>
            <Link href="/shop?sort=best_selling" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={bestSellers} />
        </section>
      )}

      {/* Testimonials */}
      {showTestimonials && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">What Our Customers Say</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t: any, i: number) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <StarRating rating={t.rating || 5} />
                <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">"{t.content || t.body}"</p>
                <div className="mt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">{t.author_name}</p>
                  {t.role_company && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role_company}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Brands strip */}
      {showBrands && brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-xl font-bold text-gray-700 dark:text-gray-300">Brands We Carry</h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {brands.slice(0, 12).map((brand: any) => (
              <Link
                key={brand.id}
                href={`/shop?brand=${brand.slug}`}
                className="flex h-14 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                {brand.logo ? (
                  <Image src={brand.logo} alt={brand.name} width={80} height={32} className="object-contain grayscale hover:grayscale-0 transition" />
                ) : (
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{brand.name}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Gaming World Teaser */}
      {showGamingBanner && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 p-10 text-white">
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.3) 0%, transparent 50%)'
              }}
            />
            <div className="relative flex flex-col items-center text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/30 border border-purple-500/30">
                <Gamepad2 className="h-8 w-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-extrabold">{gamingTitle}</h2>
              <p className="max-w-lg text-gray-300">{gamingSubtitle}</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-600/20 px-6 py-2 text-sm font-semibold text-purple-300">
                ✨ Coming Soon
              </div>
              <Link
                href="/gaming-world"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-500 transition"
              >
                {gamingCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      {showNewsletter && (
        <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-900/40 dark:bg-blue-950/30">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Stay in the Loop</h2>
            <p className="mt-1 mb-5 text-sm text-gray-600 dark:text-gray-400">
              Subscribe for the latest deals, product launches, and tech news.
            </p>
            <NewsletterSignup />
          </div>
        </section>
      )}
    </div>
  );
}
