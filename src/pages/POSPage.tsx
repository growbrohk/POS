import { useState, useMemo } from 'react';
import { ProductWithVariants, ProductVariant, SaleType, Brand } from '@/types/pos';
import { useProducts } from '@/hooks/useProducts';
import { createSale } from '@/lib/api/sales';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategoryTabs } from '@/components/pos/CategoryTabs';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { VariantSelector } from '@/components/pos/VariantSelector';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface POSPageProps {
  brand: Brand;
}

export function POSPage({ brand }: POSPageProps) {
  const { products, categories, loading, refetch } = useProducts(brand.id);
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null);
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const handleSale = async (data: {
    variant: ProductVariant;
    quantity: number;
    saleType: SaleType;
    discountAmount?: number;
  }) => {
    if (!selectedProduct) return;

    const variantPrice = Number(selectedProduct.price) + Number(data.variant.additional_price || 0);

    const sale = await createSale({
      brandId: brand.id,
      productId: selectedProduct.id,
      variantId: data.variant.id,
      quantity: data.quantity,
      unitPrice: variantPrice,
      saleType: data.saleType,
      discountAmount: data.discountAmount
    });

    if (sale) {
      const saleTypeLabels = {
        normal: 'Sale completed',
        discount: 'Discount sale completed',
        free_gift: 'Free gift recorded'
      };

      toast({
        title: saleTypeLabels[data.saleType],
        description: `${data.quantity}x ${selectedProduct.base_name} - $${Number(sale.total_price).toFixed(2)}`
      });

      refetch();
    } else {
      toast({
        title: 'Sale failed',
        description: 'There was an error processing the sale',
        variant: 'destructive'
      });
    }
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
      <div className="p-6">
        <PageHeader
          title="Point of Sale"
          description="Select products to process sales"
        />

        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <ProductGrid
          products={filteredProducts}
          onProductSelect={setSelectedProduct}
        />

        <VariantSelector
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSale={handleSale}
        />
      </div>
    </MainLayout>
  );
}
