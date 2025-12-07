import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { AuthForm } from "@/components/auth/AuthForm";
import { POSPage } from "@/pages/POSPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ImportExportPage } from "@/pages/ImportExportPage";
import { SalesPage } from "@/pages/SalesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { Loader2, AlertCircle } from "lucide-react";

const queryClient = new QueryClient();

// Check if Supabase is configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function ConfigError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-destructive/50 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Configuration Error</h2>
        <p className="text-muted-foreground mb-4">
          Supabase is not properly configured. Please check your <code className="text-sm bg-muted px-1 rounded">.env</code> file.
        </p>
        <div className="text-left text-sm space-y-2 bg-muted/50 p-3 rounded">
          <p><strong>Required variables:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><code>VITE_SUPABASE_URL</code> {!SUPABASE_URL && <span className="text-destructive">(missing)</span>}</li>
            <li><code>VITE_SUPABASE_PUBLISHABLE_KEY</code> {!SUPABASE_KEY && <span className="text-destructive">(missing)</span>}</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          After updating your .env file, restart your development server.
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const { brand, loading: brandLoading, setBrand } = useBrand();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  if (brandLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your shop...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your shop...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<POSPage brand={brand} />} />
      <Route path="/products" element={<ProductsPage brand={brand} />} />
      <Route path="/import-export" element={<ImportExportPage brand={brand} />} />
      <Route path="/sales" element={<SalesPage brand={brand} />} />
      <Route path="/settings" element={<SettingsPage brand={brand} onBrandUpdate={setBrand} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  // Show error if Supabase is not configured
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('placeholder') || SUPABASE_KEY.includes('placeholder')) {
    return <ConfigError />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
