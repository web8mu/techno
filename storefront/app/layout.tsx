import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Techno Tronics Ltd — Premium Electronics in Mauritius',
    template: '%s | Techno Tronics Ltd',
  },
  description: 'Shop the latest laptops, gaming hardware, components, and accessories at Techno Tronics. Premium electronics retailer in Mauritius.',
  keywords: ['electronics', 'gaming', 'laptops', 'computers', 'Mauritius', 'Techno Tronics'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://technotronics.mu'),
  openGraph: {
    type: 'website',
    locale: 'en_MU',
    siteName: 'Techno Tronics Ltd',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid #e2e8f0',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
