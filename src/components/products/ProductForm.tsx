import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: string;
    sub_category: string;
    base_name: string;
    description: string;
    price: number;
  }) => void;
  initialData?: {
    category?: string;
    sub_category?: string;
    base_name?: string;
    description?: string;
    price?: number;
  };
  title?: string;
}

export function ProductForm({ open, onClose, onSubmit, initialData, title = 'Add Product' }: ProductFormProps) {
  const [category, setCategory] = useState(initialData?.category || '');
  const [subCategory, setSubCategory] = useState(initialData?.sub_category || '');
  const [baseName, setBaseName] = useState(initialData?.base_name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseName.trim() || !price) return;

    onSubmit({
      category: category.trim(),
      sub_category: subCategory.trim(),
      base_name: baseName.trim(),
      description: description.trim(),
      price: Number(price)
    });

    // Reset form
    setCategory('');
    setSubCategory('');
    setBaseName('');
    setDescription('');
    setPrice('');
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
              <Label className="input-label">Category</Label>
              <Input
                placeholder="e.g., Tee"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="input-group">
              <Label className="input-label">Sub-category</Label>
              <Input
                placeholder="e.g., Graphic Tees"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <Label className="input-label">Product Name *</Label>
            <Input
              placeholder="e.g., 777RC x Years Washed Tee"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Label className="input-label">Description</Label>
            <Textarea
              placeholder="Product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="input-group">
            <Label className="input-label">Base Price *</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
              step={0.01}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {title.includes('Edit') ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
