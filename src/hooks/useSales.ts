import { useState, useEffect, useCallback } from 'react';
import { SaleWithDetails, SaleType } from '@/types/pos';
import { fetchSales, calculateSalesSummary } from '@/lib/api/sales';

interface SalesFilters {
  startDate?: string;
  endDate?: string;
  saleType?: SaleType | 'all';
  category?: string;
  productId?: number;
}

export function useSales(brandId: number | null, initialFilters?: SalesFilters) {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SalesFilters>(initialFilters || {});

  const loadSales = useCallback(async () => {
    if (!brandId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchSales(brandId, filters);
      setSales(data);
      setError(null);
    } catch (err) {
      setError('Failed to load sales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [brandId, filters]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const summary = calculateSalesSummary(sales);

  return {
    sales,
    summary,
    loading,
    error,
    filters,
    setFilters,
    refetch: loadSales
  };
}
