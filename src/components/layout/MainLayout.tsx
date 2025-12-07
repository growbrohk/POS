import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Brand } from '@/types/pos';

interface MainLayoutProps {
  children: ReactNode;
  brand: Brand | null;
}

export function MainLayout({ children, brand }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar brand={brand} />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
