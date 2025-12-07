import { SaleType } from '@/types/pos';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SalesFiltersProps {
  startDate: string;
  endDate: string;
  saleType: SaleType | 'all';
  category: string;
  categories: string[];
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSaleTypeChange: (type: SaleType | 'all') => void;
  onCategoryChange: (category: string) => void;
}

export function SalesFilters({
  startDate,
  endDate,
  saleType,
  category,
  categories,
  onStartDateChange,
  onEndDateChange,
  onSaleTypeChange,
  onCategoryChange
}: SalesFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="input-group">
        <Label className="input-label">From Date</Label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
      </div>

      <div className="input-group">
        <Label className="input-label">To Date</Label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>

      <div className="input-group">
        <Label className="input-label">Sale Type</Label>
        <Select value={saleType} onValueChange={(v) => onSaleTypeChange(v as SaleType | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="discount">Discount</SelectItem>
            <SelectItem value="free_gift">Free Gift</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="input-group">
        <Label className="input-label">Category</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
