import { useAuth } from '@/hooks/useAuth';
import { useBrand } from '@/hooks/useBrand';
import { AuthForm } from '@/components/auth/AuthForm';
import { POSPage } from './POSPage';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const { brand, loading: brandLoading } = useBrand();

  if (authLoading || (user && brandLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
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

  return <POSPage brand={brand} />;
};

export default Index;
