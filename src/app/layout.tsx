import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { CartHydration } from '@/components/cart/CartHydration';
import { Toaster } from '@/components/admin-ui/sonner';
import './globals.css';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'akra',
  description: 'Minimalist streetwear.',
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
