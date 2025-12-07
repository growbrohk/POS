import { supabase } from "@/integrations/supabase/client";
import { ProductVariant } from "@/types/pos";

export async function createVariant(data: {
  product_id: number;
  color?: string;
  size?: string;
  sku?: string;
  barcode?: string;
  stock?: number;
  additional_price?: number;
}): Promise<ProductVariant | null> {
  const { data: variant, error } = await supabase
    .from('product_variants')
    .insert({
      product_id: data.product_id,
      color: data.color || null,
      size: data.size || null,
      sku: data.sku || null,
      barcode: data.barcode || null,
      stock: data.stock || 0,
      additional_price: data.additional_price || 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating variant:', error);
    return null;
  }

  return variant as ProductVariant;
}

export async function updateVariant(variantId: number, data: Partial<ProductVariant>): Promise<ProductVariant | null> {
  const { data: variant, error } = await supabase
    .from('product_variants')
    .update(data)
    .eq('id', variantId)
    .select()
    .single();

  if (error) {
    console.error('Error updating variant:', error);
    return null;
  }

  return variant as ProductVariant;
}

export async function deleteVariant(variantId: number): Promise<boolean> {
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', variantId);

  if (error) {
    console.error('Error deleting variant:', error);
    return false;
  }

  return true;
}

export async function updateStock(variantId: number, newStock: number): Promise<boolean> {
  const { error } = await supabase
    .from('product_variants')
    .update({ stock: newStock })
    .eq('id', variantId);

  if (error) {
    console.error('Error updating stock:', error);
    return false;
  }

  return true;
}

export async function deductStock(variantId: number, quantity: number): Promise<boolean> {
  // First get current stock
  const { data: variant, error: fetchError } = await supabase
    .from('product_variants')
    .select('stock')
    .eq('id', variantId)
    .single();

  if (fetchError || !variant) {
    console.error('Error fetching variant:', fetchError);
    return false;
  }

  const newStock = Math.max(0, (variant.stock || 0) - quantity);

  const { error } = await supabase
    .from('product_variants')
    .update({ stock: newStock })
    .eq('id', variantId);

  if (error) {
    console.error('Error deducting stock:', error);
    return false;
  }

  return true;
}
