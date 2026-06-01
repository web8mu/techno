'use client';

import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceRangeSlider } from './PriceRangeSlider';

interface FilterState {
  categories: string[];
  brands: string[];
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: Category[];
  brands: Brand[];
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSidebar({ filters, onChange, categories, brands, isOpen, onClose }: FilterSidebarProps) {
  const toggleCategory = (slug: string) => {
    onChange({
      ...filters,
      categories: filters.categories.includes(slug)
        ? filters.categories.filter((c) => c !== slug)
        : [...filters.categories, slug],
    });
  };

  const toggleBrand = (slug: string) => {
    onChange({
      ...filters,
      brands: filters.brands.includes(slug)
        ? filters.brands.filter((b) => b !== slug)
        : [...filters.brands, slug],
    });
  };

  const clearAll = () => {
    onChange({ categories: [], brands: [], minPrice: '', maxPrice: '', inStock: false });
  };

  const hasFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock;

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-blue-600 hover:underline dark:text-blue-400">
            Clear all
          </button>
        )}
      </div>

      {/* In Stock Toggle */}
      <div>
        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Stock Only</span>
          <div
            onClick={() => onChange({ ...filters, inStock: !filters.inStock })}
            className={cn(
              'relative h-5 w-9 rounded-full transition-colors',
              filters.inStock ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                filters.inStock ? 'translate-x-4' : 'translate-x-0.5'
              )}
            />
          </div>
        </label>
      </div>

      {/* Price Range */}
      <PriceRangeSlider
        min={filters.minPrice}
        max={filters.maxPrice}
        onMinChange={(val) => onChange({ ...filters, minPrice: val })}
        onMaxChange={(val) => onChange({ ...filters, maxPrice: val })}
      />

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Categories</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <label key={cat.id} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat.slug)}
                  onChange={() => toggleCategory(cat.slug)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Brands</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand.id} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">{content}</aside>

      {/* Mobile drawer */}
      <>
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={onClose}
        />
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 dark:bg-gray-900 lg:hidden',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
          {content}
        </div>
      </>
    </>
  );
}
