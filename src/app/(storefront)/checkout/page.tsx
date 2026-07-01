import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getProductById } from '@/lib/data-store';
import { siteConfig } from '@/config/site';
import { getSiteSettings } from '@/lib/site-settings';
import type { CartItem } from '@/types';
import { CheckoutClient } from './CheckoutClient';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ productId?: string; error?: string }>;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { productId, error } = await searchParams;
  const symbol = siteConfig.currency.symbol;
  const settings = await getSiteSettings();

  // "Buy Now" fast-lane: a single product is supplied via the URL and the
  // server resolves it authoritatively, bypassing the persistent cart.
  let buyNowItem: CartItem | null = null;
  if (productId) {
    const product = await getProductById(productId);
    if (!product) notFound();
    buyNowItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      size: product.size,
      image: product.images[0] ?? null,
    };
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="site-container py-10">
          <h1 className="text-page-title font-bold uppercase tracking-section mb-8">Checkout</h1>
          <CheckoutClient
            mode={productId ? 'buynow' : 'cart'}
            buyNowItem={buyNowItem}
            symbol={symbol}
            shippingSettings={settings.shipping}
            paymentFailed={error === 'payment_failed'}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
