import { ProductWithVariants, SaleWithDetails } from "@/types/pos";

interface CSVRow {
  category: string;
  sub_category: string;
  base_name: string;
  color: string;
  size: string;
  sku: string;
  barcode: string;
  price: string;
  additional_price: string;
  stock: string;
}

export function exportProductsToCSV(products: ProductWithVariants[]): string {
  const headers = [
    'category',
    'sub_category',
    'base_name',
    'color',
    'size',
    'sku',
    'barcode',
    'price',
    'additional_price',
    'stock'
  ];

  const rows: string[] = [headers.join(',')];

  products.forEach(product => {
    if (product.variants.length === 0) {
      // Product with no variants
      rows.push([
        escapeCsvField(product.category || ''),
        escapeCsvField(product.sub_category || ''),
        escapeCsvField(product.base_name),
        '',
        '',
        '',
        '',
        String(product.price),
        '0',
        '0'
      ].join(','));
    } else {
      product.variants.forEach(variant => {
        rows.push([
          escapeCsvField(product.category || ''),
          escapeCsvField(product.sub_category || ''),
          escapeCsvField(product.base_name),
          escapeCsvField(variant.color || ''),
          escapeCsvField(variant.size || ''),
          escapeCsvField(variant.sku || ''),
          escapeCsvField(variant.barcode || ''),
          String(product.price),
          String(variant.additional_price || 0),
          String(variant.stock || 0)
        ].join(','));
      });
    }
  });

  return rows.join('\n');
}

export function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header.trim().toLowerCase().replace(/ /g, '_')] = values[index] || '';
    });

    rows.push(row as unknown as CSVRow);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function exportSalesToCSV(sales: SaleWithDetails[]): string {
  const headers = [
    'date',
    'product_name',
    'category',
    'color',
    'size',
    'quantity',
    'sale_type',
    'discount_amount',
    'total_price',
    'note'
  ];

  const rows: string[] = [headers.join(',')];

  sales.forEach(sale => {
    rows.push([
      new Date(sale.created_at).toISOString(),
      escapeCsvField(sale.product?.base_name || 'Unknown'),
      escapeCsvField(sale.product?.category || ''),
      escapeCsvField(sale.variant?.color || ''),
      escapeCsvField(sale.variant?.size || ''),
      String(sale.quantity),
      sale.sale_type,
      String(sale.discount_amount),
      String(sale.total_price),
      escapeCsvField(sale.note || '')
    ].join(','));
  });

  return rows.join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
