import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductVariant } from '@/types/pos';

interface VariantFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    color: string;
    size: string;
    sku: string;
    barcode: string;
    stock: number;
    additional_price: number;
  }) => void;
  initialData?: Partial<ProductVariant>;
  title?: string;
}

export function VariantForm({ open, onClose, onSubmit, initialData, title = 'Add Variant' }: VariantFormProps) {
  const [color, setColor] = useState(initialData?.color || '');
  const [size, setSize] = useState(initialData?.size || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [stock, setStock] = useState(initialData?.stock?.toString() || '0');
  const [additionalPrice, setAdditionalPrice] = useState(
    initialData?.additional_price?.toString() || '0'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      color: color.trim(),
      size: size.trim(),
      sku: sku.trim(),
      barcode: barcode.trim(),
      stock: Number(stock),
      additional_price: Number(additionalPrice)
    });

    // Reset form
    setColor('');
    setSize('');
    setSku('');
    setBarcode('');
    setStock('0');
    setAdditionalPrice('0');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <Label className="input-label">Color</Label>
              <Input
                placeholder="e.g., Black"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div className="input-group">
              <Label className="input-label">Size</Label>
              <Input
                placeholder="e.g., M"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <Label className="input-label">SKU</Label>
              <Input
                placeholder="Stock Keeping Unit"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
            <div className="input-group">
              <Label className="input-label">Barcode</Label>
              <Input
                placeholder="Barcode number"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <Label className="input-label">Stock</Label>
              <Input
                type="number"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min={0}
              />
            </div>
            <div className="input-group">
              <Label className="input-label">Additional Price</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={additionalPrice}
                onChange={(e) => setAdditionalPrice(e.target.value)}
                min={0}
                step={0.01}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {title.includes('Edit') ? 'Save Changes' : 'Add Variant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
