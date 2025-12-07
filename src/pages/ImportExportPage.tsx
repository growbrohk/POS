import { useState, useRef } from 'react';
import { Brand } from '@/types/pos';
import { useProducts } from '@/hooks/useProducts';
import { createProduct } from '@/lib/api/products';
import { createVariant, updateVariant } from '@/lib/api/variants';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportProductsToCSV, parseCSV, downloadCSV } from '@/lib/csv';
import { Download, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';

interface ImportExportPageProps {
  brand: Brand;
}

export function ImportExportPage({ brand }: ImportExportPageProps) {
  const { products, refetch } = useProducts(brand.id);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; updated: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    const csv = exportProductsToCSV(products);
    const filename = `products-${brand.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
    toast({ title: 'Export complete', description: `${products.length} products exported` });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const content = await file.text();
      const rows = parseCSV(content);

      if (rows.length === 0) {
        toast({ title: 'Invalid CSV', description: 'No data found in the file', variant: 'destructive' });
        return;
      }

      let created = 0;
      let updated = 0;

      // Group rows by product (category + sub_category + base_name)
      const productMap = new Map<string, typeof rows>();

      rows.forEach(row => {
        const key = `${row.category}|${row.sub_category}|${row.base_name}`;
        if (!productMap.has(key)) {
          productMap.set(key, []);
        }
        productMap.get(key)!.push(row);
      });

      // Process each product group
      for (const [key, productRows] of productMap) {
        const firstRow = productRows[0];
        
        // Check if product exists
        const existingProduct = products.find(
          p => p.category === firstRow.category &&
               p.sub_category === firstRow.sub_category &&
               p.base_name === firstRow.base_name
        );

        let productId: number;

        if (existingProduct) {
          productId = existingProduct.id;
        } else {
          // Create new product
          const newProduct = await createProduct(brand.id, {
            category: firstRow.category,
            sub_category: firstRow.sub_category,
            base_name: firstRow.base_name,
            price: Number(firstRow.price) || 0
          });

          if (!newProduct) continue;
          productId = newProduct.id;
          created++;
        }

        // Process variants
        for (const row of productRows) {
          if (!row.color && !row.size) continue;

          const existingVariant = existingProduct?.variants.find(
            v => v.color === row.color && v.size === row.size
          );

          if (existingVariant) {
            // Update variant
            await updateVariant(existingVariant.id, {
              sku: row.sku,
              barcode: row.barcode,
              stock: Number(row.stock) || 0,
              additional_price: Number(row.additional_price) || 0
            });
            updated++;
          } else {
            // Create variant
            await createVariant({
              product_id: productId,
              color: row.color,
              size: row.size,
              sku: row.sku,
              barcode: row.barcode,
              stock: Number(row.stock) || 0,
              additional_price: Number(row.additional_price) || 0
            });
            created++;
          }
        }
      }

      setImportResult({ created, updated });
      toast({
        title: 'Import complete',
        description: `${created} created, ${updated} updated`
      });
      refetch();
    } catch (err) {
      console.error('Import error:', err);
      toast({
        title: 'Import failed',
        description: 'There was an error processing the file',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <MainLayout brand={brand}>
      <div className="p-6">
        <PageHeader
          title="Import / Export"
          description="Bulk manage your product catalog with CSV files"
        />

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          {/* Export Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Export Products</h3>
                <p className="text-sm text-muted-foreground">
                  Download all products as CSV
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>{products.length}</strong> products with{' '}
                  <strong>{products.reduce((sum, p) => sum + p.variants.length, 0)}</strong> variants
                </p>
              </div>

              <Button onClick={handleExport} className="w-full" disabled={products.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </div>

          {/* Import Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Import Products</h3>
                <p className="text-sm text-muted-foreground">
                  Upload CSV to add or update products
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-sm">
                <p className="font-medium text-foreground mb-2">CSV Format:</p>
                <code className="text-xs text-muted-foreground break-all">
                  category,sub_category,base_name,color,size,sku,barcode,price,additional_price,stock
                </code>
              </div>

              {importResult && (
                <div className="flex items-center gap-2 p-4 bg-success/10 rounded-lg text-success">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">
                    {importResult.created} created, {importResult.updated} updated
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Select CSV File
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
