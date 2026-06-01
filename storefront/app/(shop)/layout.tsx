'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

function ShopLayoutInner({ children }: { children: React.ReactNode }) {
  // Initialize cart and auth state
  useCart();
  useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopLayoutInner>{children}</ShopLayoutInner>;
}
