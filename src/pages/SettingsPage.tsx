import { useState } from 'react';
import { Brand } from '@/types/pos';
import { updateBrandName } from '@/lib/api/brand';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Store } from 'lucide-react';

interface SettingsPageProps {
  brand: Brand;
  onBrandUpdate: (brand: Brand) => void;
}

export function SettingsPage({ brand, onBrandUpdate }: SettingsPageProps) {
  const [brandName, setBrandName] = useState(brand.name);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!brandName.trim()) {
      toast({ title: 'Brand name is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const updated = await updateBrandName(brand.id, brandName.trim());
    setSaving(false);

    if (updated) {
      onBrandUpdate(updated);
      toast({ title: 'Settings saved' });
    } else {
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    }
  };

  return (
    <MainLayout brand={brand}>
      <div className="p-6">
        <PageHeader
          title="Settings"
          description="Manage your shop settings"
        />

        <div className="max-w-xl space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Shop Information</h3>
                <p className="text-sm text-muted-foreground">
                  Basic details about your shop
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="input-group">
                <Label className="input-label">Shop Name</Label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Enter your shop name"
                />
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
