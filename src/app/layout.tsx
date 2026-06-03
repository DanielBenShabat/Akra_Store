import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { CartHydration } from '@/components/cart/CartHydration';
import { Toaster } from '@/components/admin-ui/sonner';
import { siteConfig } from '@/config/site';
import './globals.css';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const description =
  'akra is a minimalist streetwear label — heavyweight cotton, considered cuts, and quiet detailing.';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'akra — Minimalist Streetwear',
    template: '%s · akra',
  },
  description,
  applicationName: 'akra',
  openGraph: {
    type: 'website',
    siteName: 'akra',
    title: 'akra — Minimalist Streetwear',
    description,
    url: siteConfig.url,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'akra — Minimalist Streetwear',
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <CartHydration />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
