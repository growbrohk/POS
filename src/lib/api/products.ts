import { supabase } from "@/integrations/supabase/client";
import { Product, ProductVariant, ProductWithVariants, GroupedProducts } from "@/types/pos";

export async function fetchProducts(brandId: number): Promise<ProductWithVariants[]> {
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('brand_id', brandId)
    .order('category', { ascending: true })
    .order('sub_category', { ascending: true })
    .order('base_name', { ascending: true });

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return [];
  }

  const productIds = products.map(p => p.id);
  
  if (productIds.length === 0) {
    return [];
  }

  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('*')
    .in('product_id', productIds);

  if (variantsError) {
    console.error('Error fetching variants:', variantsError);
    return [];
  }

  return products.map(product => {
    const productVariants = variants.filter(v => v.product_id === product.id);
    const totalStock = productVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    return {
      ...product,
      variants: productVariants as ProductVariant[],
      total_stock: totalStock
    } as ProductWithVariants;
  });
}

export function groupProducts(products: ProductWithVariants[]): GroupedProducts {
  const grouped: GroupedProducts = {};

  products.forEach(product => {
    const category = product.category || 'Uncategorized';
    const subCategory = product.sub_category || 'General';

    if (!grouped[category]) {
      grouped[category] = {};
    }
    if (!grouped[category][subCategory]) {
      grouped[category][subCategory] = {};
    }

    const variations: GroupedProducts[string][string][number]['variations'] = {};

    product.variants.forEach(variant => {
      const color = variant.color || 'Default';
      if (!variations[color]) {
        variations[color] = {
          color,
          total_stock: 0,
          sizes: []
        };
      }

      const variantPrice = Number(product.price) + Number(variant.additional_price || 0);
      variations[color].sizes.push({
        variant_id: variant.id,
        size: variant.size,
        stock: variant.stock || 0,
        price: variantPrice
      });
      variations[color].total_stock += variant.stock || 0;
    });

    grouped[category][subCategory][product.id] = {
      product_id: product.id,
      base_name: product.base_name,
      price: Number(product.price),
      description: product.description,
      total_stock: product.total_stock,
      variations
    };
  });

  return grouped;
}

export async function createProduct(brandId: number, data: {
  category?: string;
  sub_category?: string;
  base_name: string;
  description?: string;
  price: number;
}): Promise<Product | null> {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      brand_id: brandId,
      category: data.category || null,
      sub_category: data.sub_category || null,
      base_name: data.base_name,
      description: data.description || null,
      price: data.price
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return null;
  }

  return product as Product;
}

export async function updateProduct(productId: number, data: Partial<Product>): Promise<Product | null> {
  const { data: product, error } = await supabase
    .from('products')
    .update(data)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return null;
  }

  return product as Product;
}

export async function deleteProduct(productId: number): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }

  return true;
}
