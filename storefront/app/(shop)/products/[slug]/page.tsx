import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { catalogApi } from '@/lib/api';
import { buildProductMetadata, buildProductJsonLd } from '@/lib/seo';
import { ImageGallery } from '@/components/product/ImageGallery';
import { SpecsTable } from '@/components/product/SpecsTable';
import { ProductGrid } from '@/components/product/ProductGrid';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Badge } from '@/components/common/Badge';
import { ProductViewTracker } from './ProductViewTracker';
import Link from 'next/link';
import { ChevronRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    const res = await catalogApi.getProduct(slug);
    return res.data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product Not Found' };
  return buildProductMetadata(product);
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  // Fetch related products
  let relatedProducts: any[] = [];
  try {
    const relatedRes = await catalogApi.getProducts({
      category: product.category?.slug,
      per_page: 4,
      exclude: product.id,
    });
    relatedProducts = relatedRes.data.data?.filter((p: any) => p.id !== product.id).slice(0, 4) || [];
  } catch {}

  const price = parseFloat(product.price || 0);
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const isOnSale = salePrice !== null && salePrice < price;
  const discount = isOnSale ? Math.round(((price - salePrice!) / price) * 100) : 0;

  const stockStatus =
    product.stock === 0
      ? 'out'
      : product.stock <= 5
        ? 'low'
        : 'in';

  const jsonLd = buildProductJsonLd(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductViewTracker product={product} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/shop" className="hover:text-blue-600 dark:hover:text-blue-400">Shop</Link>
          {product.category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
        </nav>

        {/* Main product layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <ImageGallery images={product.images || []} productName={product.name} />

          {/* Details */}
          <div className="space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {isOnSale && <Badge variant="red">Sale — {discount}% off</Badge>}
              {product.is_featured && <Badge variant="blue">Featured</Badge>}
              {product.is_best_seller && <Badge variant="amber">Best Seller</Badge>}
            </div>

            {/* Brand */}
            {product.brand && (
              <Link
                href={`/shop?brand=${product.brand.slug}`}
                className="text-sm font-semibold uppercase tracking-widest text-blue-600 hover:underline dark:text-blue-400"
              >
                {product.brand.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-3xl">
              {product.name}
            </h1>

            {/* SKU */}
            <p className="text-xs text-gray-400">SKU: {product.sku}</p>

            {/* Price */}
            <div className="flex items-end gap-3">
              <CurrencyDisplay
                amount={isOnSale ? salePrice! : price}
                className="text-3xl font-extrabold text-gray-900 dark:text-white"
              />
              {isOnSale && (
                <CurrencyDisplay
                  amount={price}
                  className="text-xl text-gray-400 line-through dark:text-gray-500"
                />
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {stockStatus === 'in' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">In Stock</span>
                </>
              )}
              {stockStatus === 'low' && (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Low Stock — Only {product.stock} left
                  </span>
                </>
              )}
              {stockStatus === 'out' && (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Out of Stock</span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {product.short_description}
              </p>
            )}

            {/* Add to Cart */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>

        {/* Description + Specs */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {product.description && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Description</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </section>
            )}

            {/* Specs */}
            {product.specs && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Specifications</h2>
                <SpecsTable specs={product.specs} />
              </section>
            )}
          </div>

          {/* Sidebar meta */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Product Info</h3>
              {product.category && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Category</span>
                  <Link href={`/shop?category=${product.category.slug}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                    {product.category.name}
                  </Link>
                </div>
              )}
              {product.brand && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Brand</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product.brand.name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">SKU</span>
                <span className="font-mono text-xs font-medium text-gray-900 dark:text-white">{product.sku}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Related Products</h2>
            <ProductGrid products={relatedProducts} cols={4} />
          </section>
        )}
      </div>
    </>
  );
}
