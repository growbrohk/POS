import { useState } from 'react';
import { ProductWithVariants, ProductVariant } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Package } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProductListProps {
  products: ProductWithVariants[];
  onAddVariant: (product: ProductWithVariants) => void;
  onEditProduct: (product: ProductWithVariants) => void;
  onDeleteProduct: (productId: number) => void;
  onEditVariant: (variant: ProductVariant, product: ProductWithVariants) => void;
  onDeleteVariant: (variantId: number) => void;
}

export function ProductList({
  products,
  onAddVariant,
  onEditProduct,
  onDeleteProduct,
  onEditVariant,
  onDeleteVariant
}: ProductListProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'variant'; id: number } | null>(null);

  // Group products by category and sub-category
  const grouped = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    const subCategory = product.sub_category || 'General';
    
    if (!acc[category]) acc[category] = {};
    if (!acc[category][subCategory]) acc[category][subCategory] = [];
    acc[category][subCategory].push(product);
    
    return acc;
  }, {} as Record<string, Record<string, ProductWithVariants[]>>);

  const toggleProduct = (productId: number) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'product') {
      onDeleteProduct(deleteTarget.id);
    } else {
      onDeleteVariant(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No products yet</h3>
        <p className="text-sm text-muted-foreground/70">Add your first product to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, subCategories]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              {category}
            </h2>
            
            {Object.entries(subCategories).map(([subCategory, categoryProducts]) => (
              <div key={subCategory} className="ml-4 space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">{subCategory}</h3>
                
                <div className="space-y-2">
                  {categoryProducts.map((product) => {
                    const isExpanded = expandedProducts.has(product.id);
                    
                    return (
                      <div key={product.id} className="border border-border rounded-lg overflow-hidden">
                        {/* Product Header */}
                        <div className="flex items-center gap-3 p-4 bg-card">
                          <button
                            onClick={() => toggleProduct(product.id)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {product.base_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              ${Number(product.price).toFixed(2)} • {product.variants.length} variants • {product.total_stock} total stock
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onAddVariant(product)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Variant
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditProduct(product)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget({ type: 'product', id: product.id })}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Variants */}
                        {isExpanded && product.variants.length > 0 && (
                          <div className="border-t border-border">
                            <table className="data-table">
                              <thead>
                                <tr className="bg-muted/50">
                                  <th>Color</th>
                                  <th>Size</th>
                                  <th>SKU</th>
                                  <th>Stock</th>
                                  <th>Add. Price</th>
                                  <th className="w-24"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.variants.map((variant) => (
                                  <tr key={variant.id}>
                                    <td>{variant.color || '-'}</td>
                                    <td>{variant.size || '-'}</td>
                                    <td className="font-mono text-xs">{variant.sku || '-'}</td>
                                    <td>
                                      <span className={variant.stock === 0 ? 'text-destructive' : ''}>
                                        {variant.stock}
                                      </span>
                                    </td>
                                    <td>
                                      {variant.additional_price
                                        ? `+$${Number(variant.additional_price).toFixed(2)}`
                                        : '-'}
                                    </td>
                                    <td>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => onEditVariant(variant, product)}
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive"
                                          onClick={() => setDeleteTarget({ type: 'variant', id: variant.id })}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {isExpanded && product.variants.length === 0 && (
                          <div className="border-t border-border p-4 text-center text-sm text-muted-foreground">
                            No variants yet. Add color and size variations.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'product'
                ? 'This will permanently delete the product and all its variants.'
                : 'This will permanently delete this variant.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
