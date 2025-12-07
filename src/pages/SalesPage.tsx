import { useState } from 'react';
import { Brand, SaleType } from '@/types/pos';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SalesFilters } from '@/components/sales/SalesFilters';
import { SalesSummary } from '@/components/sales/SalesSummary';
import { SalesTable } from '@/components/sales/SalesTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportSalesToCSV, downloadCSV } from '@/lib/csv';
import { Download, Loader2 } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface SalesPageProps {
  brand: Brand;
}

export function SalesPage({ brand }: SalesPageProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [saleType, setSaleType] = useState<SaleType | 'all'>('all');
  const [category, setCategory] = useState('all');

  const { sales, summary, loading, setFilters } = useSales(brand.id, {
    startDate,
    endDate,
    saleType,
    category
  });

  const { categories } = useProducts(brand.id);
  const { toast } = useToast();

  const handleFilterChange = (updates: {
    startDate?: string;
    endDate?: string;
    saleType?: SaleType | 'all';
    category?: string;
  }) => {
    if (updates.startDate !== undefined) setStartDate(updates.startDate);
    if (updates.endDate !== undefined) setEndDate(updates.endDate);
    if (updates.saleType !== undefined) setSaleType(updates.saleType);
    if (updates.category !== undefined) setCategory(updates.category);

    setFilters({
      startDate: updates.startDate ?? startDate,
      endDate: updates.endDate ?? endDate,
      saleType: updates.saleType ?? saleType,
      category: updates.category ?? category
    });
  };

  const handleExport = () => {
    const csv = exportSalesToCSV(sales);
    const filename = `sales-${brand.name.toLowerCase().replace(/\s+/g, '-')}-${startDate}-to-${endDate}.csv`;
    downloadCSV(csv, filename);
    toast({ title: 'Export complete', description: `${sales.length} sales exported` });
  };

  if (loading) {
    return (
      <MainLayout brand={brand}>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout brand={brand}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Sales History"
          description="View and analyze your sales data"
          actions={
            <Button onClick={handleExport} disabled={sales.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          }
        />

        <SalesFilters
          startDate={startDate}
          endDate={endDate}
          saleType={saleType}
          category={category}
          categories={categories}
          onStartDateChange={(date) => handleFilterChange({ startDate: date })}
          onEndDateChange={(date) => handleFilterChange({ endDate: date })}
          onSaleTypeChange={(type) => handleFilterChange({ saleType: type })}
          onCategoryChange={(cat) => handleFilterChange({ category: cat })}
        />

        <SalesSummary
          totalUnits={summary.totalUnits}
          totalRevenue={summary.totalRevenue}
          totalDiscounts={summary.totalDiscounts}
          freeGiftsCount={summary.freeGiftsCount}
        />

        <SalesTable sales={sales} />
      </div>
    </MainLayout>
  );
}
