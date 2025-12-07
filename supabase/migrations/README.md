# Supabase Database Migration Files

This directory contains SQL migration files for setting up the POS system database.

## Files

### 1. `complete_schema.sql`
- **Use case**: Safe migration that uses `CREATE TABLE IF NOT EXISTS`
- **When to use**: When you want to add tables without dropping existing data
- **Best for**: Production environments or when you're not sure if tables exist

### 2. `fresh_setup.sql`
- **Use case**: Complete fresh setup that drops all existing tables first
- **When to use**: Development, testing, or when you want to start completely fresh
- **Warning**: ⚠️ This will DELETE all existing data!

### 3. `20251207032403_58dc2a9f-95ca-47ee-ba2b-f8bdc38538c6.sql`
- **Use case**: Original migration file (if using Supabase migrations)
- **When to use**: If you're using Supabase CLI migrations

## How to Use

### Option 1: Supabase Dashboard (Recommended for beginners)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `complete_schema.sql` or `fresh_setup.sql`
4. Click **Run** to execute

### Option 2: Supabase CLI
```bash
# If using migrations (recommended)
supabase migration new complete_schema
# Then copy the SQL into the new migration file
supabase db push

# Or for fresh setup
supabase db reset
# Then run fresh_setup.sql in SQL Editor
```

### Option 3: Direct SQL Connection
```bash
# Connect to your database and run:
psql -h your-db-host -U postgres -d postgres -f fresh_setup.sql
```

## Database Schema Overview

### Tables Created

1. **brands** - Stores brand/shop information for each user
   - One brand per user (typically)
   - Links to `auth.users` via `user_id`

2. **products** - Master product table
   - Base product information (name, price, category)
   - Belongs to a brand
   - Can have multiple variants

3. **product_variants** - Product variations (color + size)
   - Links to products
   - Stores SKU, barcode, stock, additional pricing
   - Unique constraint on (product_id, color, size)

4. **sales** - Sales transaction records
   - Links to products and variants
   - Tracks quantity, price, discounts, sale type
   - Supports normal, discount, and free_gift sale types

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own brand's data
- Policies enforce data isolation between users

### Indexes

Performance indexes are created on:
- Foreign keys (brand_id, product_id, etc.)
- Frequently queried columns (category, created_at, etc.)
- Unique identifiers (SKU, barcode)

### Triggers

- Automatic `updated_at` timestamp updates on brands, products, and variants

## Important Notes

- All tables use `BIGSERIAL` for IDs (supports large datasets)
- Foreign keys use appropriate `ON DELETE` behaviors:
  - `CASCADE` for parent-child relationships
  - `SET NULL` for sales when products/variants are deleted
- Check constraints ensure data integrity (positive prices, quantities, etc.)
- All timestamps use `TIMESTAMPTZ` (timezone-aware)

## Troubleshooting

### "relation already exists" error
- Use `fresh_setup.sql` to drop and recreate, OR
- Use `complete_schema.sql` which has `IF NOT EXISTS` clauses

### RLS policies not working
- Ensure you're authenticated in Supabase
- Check that `auth.uid()` returns a valid user ID
- Verify policies are created correctly

### Foreign key constraint errors
- Ensure tables are created in order: brands → products → variants → sales
- Check that referenced IDs exist before inserting

## Next Steps

After running the migration:
1. Verify tables are created in Supabase Dashboard → Table Editor
2. Test RLS policies by creating a test user
3. Generate TypeScript types: `supabase gen types typescript --project-id your-project-id > src/integrations/supabase/types.ts`

