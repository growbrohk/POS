import { useState, useEffect } from 'react';
import { Brand } from '@/types/pos';
import { getOrCreateBrandForCurrentUser } from '@/lib/api/brand';
import { supabase } from '@/integrations/supabase/client';

export function useBrand() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBrand() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const brandData = await getOrCreateBrandForCurrentUser();
        setBrand(brandData);
      } catch (err) {
        setError('Failed to load brand');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadBrand();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadBrand();
      } else if (event === 'SIGNED_OUT') {
        setBrand(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { brand, loading, error, setBrand };
}
