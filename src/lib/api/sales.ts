import { supabase } from "@/integrations/supabase/client";
import { Sale, SaleType, SaleWithDetails } from "@/types/pos";
import { deductStock } from "./variants";

interface CreateSaleParams {
  brandId: number;
  productId: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  saleType: SaleType;
  discountAmount?: number;
  note?: string;
}

export async function createSale(params: CreateSaleParams): Promise<Sale | null> {
  const { brandId, productId, variantId, quantity, unitPrice, saleType, discountAmount = 0, note } = params;

  let totalPrice = unitPrice * quantity;

  if (saleType === 'discount') {
    totalPrice = Math.max(0, totalPrice - discountAmount);
  } else if (saleType === 'free_gift') {
    totalPrice = 0;
  }

  const actualDiscount = saleType === 'free_gift' ? unitPrice * quantity : discountAmount;

  // Deduct stock first
  const stockDeducted = await deductStock(variantId, quantity);
  if (!stockDeducted) {
    console.error('Failed to deduct stock');
    return null;
  }

  const { data: sale, error } = await supabase
    .from('sales')
    .insert({
      brand_id: brandId,
      product_id: productId,
      product_variant_id: variantId,
      quantity,
      sale_type: saleType,
      discount_amount: actualDiscount,
      total_price: totalPrice,
      note: note || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating sale:', error);
    return null;
  }

  return sale as Sale;
}

export async function fetchSales(
  brandId: number,
  filters?: {
    startDate?: string;
    endDate?: string;
    saleType?: SaleType | 'all';
    category?: string;
    productId?: number;
  }
): Promise<SaleWithDetails[]> {
  let query = supabase
    .from('sales')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate + 'T23:59:59');
  }
  if (filters?.saleType && filters.saleType !== 'all') {
    query = query.eq('sale_type', filters.saleType);
  }
  if (filters?.productId) {
    query = query.eq('product_id', filters.productId);
  }

  const { data: sales, error } = await query;

  if (error) {
    console.error('Error fetching sales:', error);
    return [];
  }

  // Fetch related products and variants
  const productIds = [...new Set(sales.map(s => s.product_id).filter(Boolean))];
  const variantIds = [...new Set(sales.map(s => s.product_variant_id).filter(Boolean))];

  const [productsRes, variantsRes] = await Promise.all([
    productIds.length > 0
      ? supabase.from('products').select('*').in('id', productIds)
      : Promise.resolve({ data: [] }),
    variantIds.length > 0
      ? supabase.from('product_variants').select('*').in('id', variantIds)
      : Promise.resolve({ data: [] })
  ]);

  const productsMap = new Map((productsRes.data || []).map(p => [p.id, p]));
  const variantsMap = new Map((variantsRes.data || []).map(v => [v.id, v]));

  let filteredSales = sales;

  // Client-side category filter
  if (filters?.category && filters.category !== 'all') {
    filteredSales = sales.filter(sale => {
      const product = productsMap.get(sale.product_id);
      return product?.category === filters.category;
    });
  }

  return filteredSales.map(sale => ({
    ...sale,
    product: productsMap.get(sale.product_id),
    variant: variantsMap.get(sale.product_variant_id)
  })) as SaleWithDetails[];
}

export function calculateSalesSummary(sales: SaleWithDetails[]) {
  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_price), 0);
  const totalDiscounts = sales.reduce((sum, s) => sum + Number(s.discount_amount), 0);
  const freeGiftsCount = sales.filter(s => s.sale_type === 'free_gift').length;

  return {
    totalUnits,
    totalRevenue,
    totalDiscounts,
    freeGiftsCount
  };
}
