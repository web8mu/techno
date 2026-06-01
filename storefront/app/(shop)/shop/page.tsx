'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { SortSelect } from '@/components/shop/SortSelect';
import { SearchBar } from '@/components/shop/SearchBar';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { catalogApi } from '@/lib/api';

interface FilterState {
  categories: string[];
  brands: string[];
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    categories: searchParams.get('category') ? [searchParams.get('category')!] : [],
    brands: searchParams.get('brand') ? [searchParams.get('brand')!] : [],
    minPrice: '',
    maxPrice: '',
    inStock: false,
  });

  // Load categories and brands once
  useEffect(() => {
    catalogApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {});
    catalogApi.getBrands().then((r) => setBrands(r.data.data || [])).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: 12, sort };
      if (search) params.search = search;
      if (filters.categories.length) params.categories = filters.categories.join(',');
      if (filters.brands.length) params.brands = filters.brands.join(',');
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.inStock) params.in_stock = 1;

      const res = await catalogApi.getProducts(params);
      setProducts(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 on filter/search change
  useEffect(() => { setPage(1); }, [search, sort, filters]);

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  const totalPages = meta ? Math.ceil(meta.total / meta.per_page) : 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Shop</h1>
        {meta && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {meta.total} product{meta.total !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} className="flex-1 min-w-48" />

        <button
          onClick={() => setFilterDrawerOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <SortSelect value={sort} onChange={setSort} />
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.categories.map((slug) => {
            const cat = categories.find((c) => c.slug === slug);
            return (
              <button
                key={slug}
                onClick={() => setFilters({ ...filters, categories: filters.categories.filter((c) => c !== slug) })}
                className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
              >
                {cat?.name || slug}
                <X className="h-3 w-3" />
              </button>
            );
          })}
          {filters.brands.map((slug) => {
            const brand = brands.find((b) => b.slug === slug);
            return (
              <button
                key={slug}
                onClick={() => setFilters({ ...filters, brands: filters.brands.filter((b) => b !== slug) })}
                className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
              >
                {brand?.name || slug}
                <X className="h-3 w-3" />
              </button>
            );
          })}
          {filters.minPrice && (
            <button
              onClick={() => setFilters({ ...filters, minPrice: '' })}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              Min: Rs {filters.minPrice} <X className="h-3 w-3" />
            </button>
          )}
          {filters.maxPrice && (
            <button
              onClick={() => setFilters({ ...filters, maxPrice: '' })}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              Max: Rs {filters.maxPrice} <X className="h-3 w-3" />
            </button>
          )}
          {filters.inStock && (
            <button
              onClick={() => setFilters({ ...filters, inStock: false })}
              className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300"
            >
              In Stock <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex gap-8">
        <FilterSidebar
          filters={filters}
          onChange={(f) => { setFilters(f); setPage(1); }}
          categories={categories}
          brands={brands}
          isOpen={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
        />

        <div className="flex-1 min-w-0">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <ProductGrid products={products} />
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { ProductGridSkeleton as _Skeleton } from "@/components/product/ProductSkeleton";
export default function ShopPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><_Skeleton count={12} /></div>}>
      <ShopContent />
    </Suspense>
  );
}
