export interface Brand {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: number;
  brand_id: number;
  category: string | null;
  sub_category: string | null;
  base_name: string;
  description: string | null;
  price: number;
  created_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  color: string | null;
  size: string | null;
  sku: string | null;
  barcode: string | null;
  stock: number;
  additional_price: number | null;
  created_at: string;
}

export interface Sale {
  id: number;
  product_variant_id: number | null;
  product_id: number | null;
  brand_id: number;
  quantity: number;
  sale_type: 'normal' | 'discount' | 'free_gift';
  discount_amount: number;
  total_price: number;
  note: string | null;
  created_at: string;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  total_stock: number;
}

export interface VariantWithProduct extends ProductVariant {
  product: Product;
}

export interface GroupedProducts {
  [category: string]: {
    [subCategory: string]: {
      [productId: number]: {
        product_id: number;
        base_name: string;
        price: number;
        description: string | null;
        total_stock: number;
        variations: {
          [color: string]: {
            color: string;
            total_stock: number;
            sizes: {
              variant_id: number;
              size: string | null;
              stock: number;
              price: number;
            }[];
          };
        };
      };
    };
  };
}

export interface SaleWithDetails extends Sale {
  product?: Product;
  variant?: ProductVariant;
}

export type SaleType = 'normal' | 'discount' | 'free_gift';
