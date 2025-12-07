import { SaleWithDetails } from '@/types/pos';
import { format } from 'date-fns';

interface SalesTableProps {
  sales: SaleWithDetails[];
}

export function SalesTable({ sales }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No sales found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="data-table">
        <thead>
          <tr className="bg-muted/50">
            <th>Date</th>
            <th>Product</th>
            <th>Variant</th>
            <th>Qty</th>
            <th>Type</th>
            <th>Discount</th>
            <th>Total</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="whitespace-nowrap">
                {format(new Date(sale.created_at), 'MMM d, yyyy h:mm a')}
              </td>
              <td>
                <span className="font-medium">
                  {sale.product?.base_name || 'Unknown Product'}
                </span>
              </td>
              <td>
                {sale.variant
                  ? `${sale.variant.color || ''} ${sale.variant.size || ''}`.trim() || '-'
                  : '-'}
              </td>
              <td>{sale.quantity}</td>
              <td>
                <span className={`badge-${sale.sale_type === 'free_gift' ? 'gift' : sale.sale_type}`}>
                  {sale.sale_type === 'free_gift' ? 'Free Gift' : sale.sale_type}
                </span>
              </td>
              <td>
                {Number(sale.discount_amount) > 0
                  ? `-$${Number(sale.discount_amount).toFixed(2)}`
                  : '-'}
              </td>
              <td className="font-medium">
                ${Number(sale.total_price).toFixed(2)}
              </td>
              <td className="max-w-[200px] truncate">
                {sale.note || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
