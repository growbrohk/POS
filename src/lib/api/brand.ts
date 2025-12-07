import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/types/pos";

export async function getOrCreateBrandForCurrentUser(): Promise<Brand | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Check for existing brand
  const { data: existingBrand, error: fetchError } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching brand:', fetchError);
    return null;
  }

  if (existingBrand) {
    return existingBrand as Brand;
  }

  // Create new brand
  const brandName = user.email?.split('@')[0] || 'My Shop';
  const { data: newBrand, error: createError } = await supabase
    .from('brands')
    .insert({
      user_id: user.id,
      name: brandName
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating brand:', createError);
    return null;
  }

  return newBrand as Brand;
}

export async function updateBrandName(brandId: number, name: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .update({ name })
    .eq('id', brandId)
    .select()
    .single();

  if (error) {
    console.error('Error updating brand:', error);
    return null;
  }

  return data as Brand;
}
