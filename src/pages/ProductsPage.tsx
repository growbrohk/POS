import { useState } from 'react';
import { ProductWithVariants, ProductVariant, Brand } from '@/types/pos';
import { useProducts } from '@/hooks/useProducts';
import { createProduct, updateProduct, deleteProduct } from '@/lib/api/products';
import { createVariant, updateVariant, deleteVariant } from '@/lib/api/variants';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductList } from '@/components/products/ProductList';
import { ProductForm } from '@/components/products/ProductForm';
import { VariantForm } from '@/components/products/VariantForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';

interface ProductsPageProps {
  brand: Brand;
}

export function ProductsPage({ brand }: ProductsPageProps) {
  const { products, loading, refetch } = useProducts(brand.id);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null);
  const [editingVariant, setEditingVariant] = useState<{ variant: ProductVariant; product: ProductWithVariants } | null>(null);
  const [variantForProduct, setVariantForProduct] = useState<ProductWithVariants | null>(null);
  const { toast } = useToast();

  const handleCreateProduct = async (data: {
    category: string;
    sub_category: string;
    base_name: string;
    description: string;
    price: number;
  }) => {
    const product = await createProduct(brand.id, data);
    if (product) {
      toast({ title: 'Product created', description: data.base_name });
      refetch();
    } else {
      toast({ title: 'Failed to create product', variant: 'destructive' });
    }
  };

  const handleUpdateProduct = async (data: {
    category: string;
    sub_category: string;
    base_name: string;
    description: string;
    price: number;
  }) => {
    if (!editingProduct) return;

    const product = await updateProduct(editingProduct.id, data);
    if (product) {
      toast({ title: 'Product updated' });
      refetch();
    } else {
      toast({ title: 'Failed to update product', variant: 'destructive' });
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId: number) => {
    const success = await deleteProduct(productId);
    if (success) {
      toast({ title: 'Product deleted' });
      refetch();
    } else {
      toast({ title: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const handleCreateVariant = async (data: {
    color: string;
    size: string;
    sku: string;
    barcode: string;
    stock: number;
    additional_price: number;
  }) => {
    if (!variantForProduct) return;

    const variant = await createVariant({
      product_id: variantForProduct.id,
      ...data
    });

    if (variant) {
      toast({ title: 'Variant added' });
      refetch();
    } else {
      toast({ title: 'Failed to add variant', variant: 'destructive' });
    }
    setVariantForProduct(null);
  };

  const handleUpdateVariant = async (data: {
    color: string;
    size: string;
    sku: string;
    barcode: string;
    stock: number;
    additional_price: number;
  }) => {
    if (!editingVariant) return;

    const variant = await updateVariant(editingVariant.variant.id, data);
    if (variant) {
      toast({ title: 'Variant updated' });
      refetch();
    } else {
      toast({ title: 'Failed to update variant', variant: 'destructive' });
    }
    setEditingVariant(null);
  };

  const handleDeleteVariant = async (variantId: number) => {
    const success = await deleteVariant(variantId);
    if (success) {
      toast({ title: 'Variant deleted' });
      refetch();
    } else {
      toast({ title: 'Failed to delete variant', variant: 'destructive' });
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
          title="Products"
          description="Manage your product catalog"
          actions={
            <Button onClick={() => setShowProductForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          }
        />

        <ProductList
          products={products}
          onAddVariant={(product) => {
            setVariantForProduct(product);
            setShowVariantForm(true);
          }}
          onEditProduct={(product) => {
            setEditingProduct(product);
            setShowProductForm(true);
          }}
          onDeleteProduct={handleDeleteProduct}
          onEditVariant={(variant, product) => {
            setEditingVariant({ variant, product });
            setShowVariantForm(true);
          }}
          onDeleteVariant={handleDeleteVariant}
        />

        <ProductForm
          open={showProductForm}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          initialData={editingProduct || undefined}
          title={editingProduct ? 'Edit Product' : 'Add Product'}
        />

        <VariantForm
          open={showVariantForm}
          onClose={() => {
            setShowVariantForm(false);
            setVariantForProduct(null);
            setEditingVariant(null);
          }}
          onSubmit={editingVariant ? handleUpdateVariant : handleCreateVariant}
          initialData={editingVariant?.variant}
          title={editingVariant ? 'Edit Variant' : 'Add Variant'}
        />
      </div>
    </MainLayout>
  );
}
