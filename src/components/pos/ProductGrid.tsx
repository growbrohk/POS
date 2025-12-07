import { ProductWithVariants } from '@/types/pos';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: ProductWithVariants[];
  onProductSelect: (product: ProductWithVariants) => void;
}

export function ProductGrid({ products, onProductSelect }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No products found</h3>
        <p className="text-sm text-muted-foreground/70">Add products in the Products section</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onProductSelect(product)}
          className="pos-card text-left group"
        >
          <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            <Package className="w-12 h-12 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-foreground text-sm line-clamp-2">
              {product.base_name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {product.category || 'Uncategorized'}
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-primary">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                {product.total_stock} in stock
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
