import { ProductCard } from './ProductCard';

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string | number;
  sale_price?: string | number | null;
  stock: number;
  images?: Array<{ url: string; alt?: string }>;
  brand?: { name: string };
  is_featured?: boolean;
  is_best_seller?: boolean;
}

interface ProductGridProps {
  products: Product[];
  cols?: 2 | 3 | 4;
}

export function ProductGrid({ products, cols = 4 }: ProductGridProps) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[cols];

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No products found</p>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} gap-4 md:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
