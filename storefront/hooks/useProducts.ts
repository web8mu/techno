'use client';

import { useState, useEffect, useCallback } from 'react';
import { catalogApi } from '@/lib/api';

interface UseProductsParams {
  page?: number;
  perPage?: number;
  search?: string;
  categories?: string[];
  brands?: string[];
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  sort?: string;
}

export function useProducts(params: UseProductsParams = {}) {
  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: Record<string, any> = {
        page: params.page || 1,
        per_page: params.perPage || 12,
      };
      if (params.search) query.search = params.search;
      if (params.categories?.length) query.categories = params.categories.join(',');
      if (params.brands?.length) query.brands = params.brands.join(',');
      if (params.minPrice) query.min_price = params.minPrice;
      if (params.maxPrice) query.max_price = params.maxPrice;
      if (params.inStock) query.in_stock = 1;
      if (params.sort) query.sort = params.sort;

      const res = await catalogApi.getProducts(query);
      setProducts(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [
    params.page, params.perPage, params.search,
    params.categories?.join(','), params.brands?.join(','),
    params.minPrice, params.maxPrice, params.inStock, params.sort,
  ]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, meta, loading, error, refetch: fetch };
}
