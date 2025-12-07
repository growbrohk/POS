-- ============================================
-- Complete Supabase Schema for POS System
-- ============================================
-- This migration creates all necessary tables, constraints, 
-- RLS policies, and indexes for the POS application.

-- ============================================
-- 1. BRANDS TABLE
-- ============================================
-- Stores brand/shop information for each user
CREATE TABLE IF NOT EXISTS public.brands (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================
-- Master product table (base product information)
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  category TEXT,
  sub_category TEXT,
  base_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PRODUCT_VARIANTS TABLE
-- ============================================
-- Product variants (color + size combinations)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color TEXT,
  size TEXT,
  sku TEXT UNIQUE,
  barcode TEXT UNIQUE,
  stock INT DEFAULT 0 CHECK (stock >= 0),
  additional_price NUMERIC(10,2) DEFAULT 0 CHECK (additional_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, color, size)
);

-- ============================================
-- 4. SALES TABLE
-- ============================================
-- Sales transaction records
CREATE TABLE IF NOT EXISTS public.sales (
  id BIGSERIAL PRIMARY KEY,
  product_variant_id BIGINT REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
  brand_id BIGINT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  sale_type TEXT DEFAULT 'normal' CHECK (sale_type IN ('normal', 'discount', 'free_gift')),
  discount_amount NUMERIC(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES - BRANDS
-- ============================================
-- Users can view their own brands
CREATE POLICY "Users can view their own brands"
  ON public.brands FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own brand
CREATE POLICY "Users can create their own brand"
  ON public.brands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own brand
CREATE POLICY "Users can update their own brand"
  ON public.brands FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own brand
CREATE POLICY "Users can delete their own brand"
  ON public.brands FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. RLS POLICIES - PRODUCTS
-- ============================================
-- Users can view products of their brand
CREATE POLICY "Users can view products of their brand"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = products.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Users can create products for their brand
CREATE POLICY "Users can create products for their brand"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Users can update products of their brand
CREATE POLICY "Users can update products of their brand"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = products.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Users can delete products of their brand
CREATE POLICY "Users can delete products of their brand"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = products.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- ============================================
-- 8. RLS POLICIES - PRODUCT_VARIANTS
-- ============================================
-- Users can view variants of their products
CREATE POLICY "Users can view variants of their products"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.brands ON brands.id = products.brand_id
      WHERE products.id = product_variants.product_id
      AND brands.user_id = auth.uid()
    )
  );

-- Users can create variants for their products
CREATE POLICY "Users can create variants for their products"
  ON public.product_variants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.brands ON brands.id = products.brand_id
      WHERE products.id = product_id
      AND brands.user_id = auth.uid()
    )
  );

-- Users can update variants of their products
CREATE POLICY "Users can update variants of their products"
  ON public.product_variants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.brands ON brands.id = products.brand_id
      WHERE products.id = product_variants.product_id
      AND brands.user_id = auth.uid()
    )
  );

-- Users can delete variants of their products
CREATE POLICY "Users can delete variants of their products"
  ON public.product_variants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.brands ON brands.id = products.brand_id
      WHERE products.id = product_variants.product_id
      AND brands.user_id = auth.uid()
    )
  );

-- ============================================
-- 9. RLS POLICIES - SALES
-- ============================================
-- Users can view sales of their brand
CREATE POLICY "Users can view sales of their brand"
  ON public.sales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = sales.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Users can create sales for their brand
CREATE POLICY "Users can create sales for their brand"
  ON public.sales FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Users can update sales of their brand
CREATE POLICY "Users can update sales of their brand"
  ON public.sales FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = sales.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Users can delete sales of their brand
CREATE POLICY "Users can delete sales of their brand"
  ON public.sales FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = sales.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- ============================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================
-- Brands indexes
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON public.brands(user_id);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_sub_category ON public.products(sub_category);
CREATE INDEX IF NOT EXISTS idx_products_base_name ON public.products(base_name);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_barcode ON public.product_variants(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(stock);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_brand_id ON public.sales(brand_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON public.sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_variant_id ON public.sales(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_sale_type ON public.sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_sales_brand_created_at ON public.sales(brand_id, created_at DESC);

-- ============================================
-- 11. FUNCTIONS & TRIGGERS (Optional)
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for brands updated_at
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for product_variants updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- END OF MIGRATION
-- ============================================

