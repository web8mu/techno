import Link from 'next/link';
import { MapPin, Phone, Mail, Share2 } from 'lucide-react';

const footerNav = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Gaming World', href: '/gaming-world' },
  { label: 'Cart', href: '/cart' },
];

const categoryLinks = [
  { label: 'Laptops', href: '/shop?category=laptops' },
  { label: 'Desktops', href: '/shop?category=desktops' },
  { label: 'Components', href: '/shop?category=components' },
  { label: 'Gaming', href: '/shop?category=gaming' },
  { label: 'Accessories', href: '/shop?category=accessories' },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-xl font-extrabold">
              <span className="text-blue-400">Techno</span>
              <span className="text-white"> Tronics</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Premium electronics and gaming retailer in Mauritius. Your destination for the latest tech.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" aria-label="Facebook">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" aria-label="Instagram">
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Navigation</h3>
            <ul className="space-y-2">
              {footerNav.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Categories</h3>
            <ul className="space-y-2">
              {categoryLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                <span>Port Louis, Mauritius</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 flex-shrink-0 text-blue-400" />
                <a href="tel:+23052000000" className="hover:text-white transition-colors">+230 5200 0000</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 flex-shrink-0 text-blue-400" />
                <a href="mailto:info@technotronics.mu" className="hover:text-white transition-colors">info@technotronics.mu</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Techno Tronics Ltd. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
