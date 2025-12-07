import { useState, useEffect, useCallback } from 'react';
import { ProductWithVariants, GroupedProducts } from '@/types/pos';
import { fetchProducts, groupProducts } from '@/lib/api/products';

export function useProducts(brandId: number | null) {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (!brandId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchProducts(brandId);
      setProducts(data);
      setGroupedProducts(groupProducts(data));
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  return {
    products,
    groupedProducts,
    categories,
    loading,
    error,
    refetch: loadProducts
  };
}
