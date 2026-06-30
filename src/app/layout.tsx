import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { Toaster } from '@/components/admin-ui/sonner';
import { siteConfig } from '@/config/site';
import './globals.css';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const description = 'AKRA — handmade one-of-a-kind knit and crochet pieces.';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'AKRA',
    template: '%s · AKRA',
  },
  description,
  applicationName: 'AKRA',
  openGraph: {
    type: 'website',
    siteName: 'AKRA',
    title: 'AKRA',
    description,
    url: siteConfig.url,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AKRA',
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
      <body className="min-h-screen flex flex-col bg-[#111111] text-foreground font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
