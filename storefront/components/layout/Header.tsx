'use client';

import { ShoppingCart, Menu, User, ChevronDown, LogOut, Package, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart';
import { useAuthStore } from '@/lib/auth';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { Badge } from '@/components/common/Badge';
import { catalogApi } from '@/lib/api';

const categoryIcons: Record<string, string> = {
  Laptops: '💻', Desktops: '🖥️', Components: '⚙️', Gaming: '🎮',
  Accessories: '🖱️', Monitors: '🖥️', Networking: '📡', Storage: '💾',
};

const navLinks = [
  { href: '/', label: 'Home' },
];

export function Header() {
  const pathname = usePathname();
  const { items, openCart } = useCartStore();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const shopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    catalogApi.getCategories()
      .then((r) => setCategories(r.data.data || []))
      .catch(() => {});
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 text-xl font-extrabold tracking-tight">
            <span className="text-blue-600 dark:text-blue-400">Techno</span>
            <span className="text-gray-900 dark:text-white"> Tronics</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex ml-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                {label}
              </Link>
            ))}

            {/* Shop mega menu */}
            <div className="relative" ref={shopMenuRef} onMouseEnter={() => setShopMenuOpen(true)} onMouseLeave={() => setShopMenuOpen(false)}>
              <Link
                href="/shop"
                className={cn(
                  'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith('/shop')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                Shop
                <ChevronDown className="h-3 w-3" />
              </Link>

              {shopMenuOpen && categories.length > 0 && (
                <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 p-3">
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((cat: any) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setShopMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <span className="text-base">{cat.icon || categoryIcons[cat.name] || '📦'}</span>
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                    <Link
                      href="/shop"
                      onClick={() => setShopMenuOpen(false)}
                      className="block rounded-lg px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      View All Products →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/gaming-world"
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/gaming-world'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              Gaming World
              <Badge variant="amber" className="text-[10px] px-1.5 py-0">Soon</Badge>
            </Link>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 rounded-t-xl"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        My Account
                      </Link>
                      <Link
                        href="/dashboard/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-b-xl"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href="/auth/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
