-- Create brands table
CREATE TABLE public.brands (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table (master product)
CREATE TABLE public.products (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  category TEXT,
  sub_category TEXT,
  base_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_variants table (color + size)
CREATE TABLE public.product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color TEXT,
  size TEXT,
  sku TEXT,
  barcode TEXT,
  stock INT DEFAULT 0,
  additional_price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, color, size)
);

-- Create sales table
CREATE TABLE public.sales (
  id BIGSERIAL PRIMARY KEY,
  product_variant_id BIGINT REFERENCES public.product_variants(id),
  product_id BIGINT REFERENCES public.products(id),
  brand_id BIGINT NOT NULL REFERENCES public.brands(id),
  quantity INT NOT NULL,
  sale_type TEXT DEFAULT 'normal' CHECK (sale_type IN ('normal', 'discount', 'free_gift')),
  discount_amount NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Brands RLS policies
CREATE POLICY "Users can view their own brands"
  ON public.brands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brand"
  ON public.brands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand"
  ON public.brands FOR UPDATE
  USING (auth.uid() = user_id);

-- Products RLS policies
CREATE POLICY "Users can view products of their brand"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = products.brand_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create products for their brand"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = brand_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update products of their brand"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = products.brand_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete products of their brand"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = products.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Product Variants RLS policies
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

-- Sales RLS policies
CREATE POLICY "Users can view sales of their brand"
  ON public.sales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = sales.brand_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sales for their brand"
  ON public.sales FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_sales_brand_id ON public.sales(brand_id);
CREATE INDEX idx_sales_created_at ON public.sales(created_at);
CREATE INDEX idx_sales_sale_type ON public.sales(sale_type);