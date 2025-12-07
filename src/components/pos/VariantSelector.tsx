import { useState, useMemo } from 'react';
import { ProductWithVariants, ProductVariant, SaleType } from '@/types/pos';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Package, AlertCircle } from 'lucide-react';

interface VariantSelectorProps {
  product: ProductWithVariants | null;
  open: boolean;
  onClose: () => void;
  onSale: (data: {
    variant: ProductVariant;
    quantity: number;
    saleType: SaleType;
    discountAmount?: number;
  }) => void;
}

export function VariantSelector({ product, open, onClose, onSale }: VariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discountAmount, setDiscountAmount] = useState('');
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  // Reset state when product changes
  useMemo(() => {
    if (product) {
      const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
      setSelectedColor(colors[0] || null);
      setSelectedSize(null);
      setQuantity(1);
      setDiscountAmount('');
      setShowDiscountInput(false);
    }
  }, [product?.id]);

  if (!product) return null;

  const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))] as string[];
  const sizesForColor = product.variants
    .filter(v => v.color === selectedColor || (!selectedColor && !v.color))
    .map(v => ({ size: v.size, stock: v.stock, id: v.id }));

  const selectedVariant = product.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  ) || product.variants.find(
    v => v.color === selectedColor && sizesForColor.length === 1
  );

  const variantPrice = selectedVariant
    ? Number(product.price) + Number(selectedVariant.additional_price || 0)
    : Number(product.price);

  const totalPrice = variantPrice * quantity;
  const maxQuantity = selectedVariant?.stock || 0;

  const handleSale = (saleType: SaleType) => {
    if (!selectedVariant) return;
    
    if (saleType === 'discount' && !showDiscountInput) {
      setShowDiscountInput(true);
      return;
    }

    onSale({
      variant: selectedVariant,
      quantity,
      saleType,
      discountAmount: saleType === 'discount' ? Number(discountAmount) : undefined
    });
    onClose();
  };

  const canSell = selectedVariant && quantity > 0 && quantity <= maxQuantity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{product.base_name}</h3>
              <p className="text-sm text-muted-foreground font-normal">
                ${variantPrice.toFixed(2)}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Color</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize(null);
                    }}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedColor === color
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizesForColor.length > 0 && sizesForColor[0].size && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Size</Label>
              <div className="flex flex-wrap gap-2">
                {sizesForColor.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSize(item.size)}
                    disabled={item.stock === 0}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedSize === item.size
                        ? 'border-primary bg-primary/10 text-primary'
                        : item.stock === 0
                        ? 'border-border bg-muted text-muted-foreground cursor-not-allowed'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {item.size}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({item.stock})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Info */}
          {selectedVariant && (
            <div className={`flex items-center gap-2 text-sm ${
              selectedVariant.stock === 0 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              <AlertCircle className="w-4 h-4" />
              {selectedVariant.stock === 0
                ? 'Out of stock'
                : `${selectedVariant.stock} available`}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quantity</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Discount Input */}
          {showDiscountInput && (
            <div className="space-y-3 animate-fade-in">
              <Label className="text-sm font-medium">Discount Amount</Label>
              <Input
                type="number"
                placeholder="Enter discount amount"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                min={0}
                max={totalPrice}
              />
              <p className="text-sm text-muted-foreground">
                Final price: ${Math.max(0, totalPrice - Number(discountAmount || 0)).toFixed(2)}
              </p>
            </div>
          )}

          {/* Total */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-foreground">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Sale Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSale('normal')}
                disabled={!canSell}
                className="pos-button-normal disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sell
              </button>
              <button
                onClick={() => handleSale('discount')}
                disabled={!canSell}
                className="pos-button-discount disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showDiscountInput ? 'Confirm' : 'Discount'}
              </button>
              <button
                onClick={() => handleSale('free_gift')}
                disabled={!canSell}
                className="pos-button-gift disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Free Gift
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
