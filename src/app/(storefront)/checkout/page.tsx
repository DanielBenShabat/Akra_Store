import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getProductById } from '@/lib/data-store';
import { calculateTotals } from '@/lib/pricing';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { CheckoutForm } from './CheckoutForm';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ productId?: string; size?: string; error?: string }>;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { productId, size, error } = await searchParams;
  if (!productId || !size) redirect('/');

  const product = await getProductById(productId);
  if (!product) notFound();

  const totals = calculateTotals(product.price);
  const symbol = siteConfig.currency.symbol;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="site-container py-10">
          <h1 className="text-section-title font-bold uppercase tracking-section mb-8">Checkout</h1>

          <p className="text-nav font-bold uppercase tracking-nav border-b border-border pb-3 mb-4">
            Order Summary
          </p>

          <div className="border border-border p-4 mb-8 flex gap-4">
            <div className="relative w-20 h-20 shrink-0 bg-border overflow-hidden">
              {product.images[0] ? (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="w-full h-full bg-border" aria-hidden="true" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-nav font-medium leading-snug">{product.name}</p>
              <p className="text-badge text-muted-foreground">Size: {size} · Qty: 1</p>
              <p className="text-nav font-bold mt-1">{formatPrice(product.price, symbol)}</p>
            </div>
          </div>

          <CheckoutForm
            productId={product.id}
            size={size}
            paymentFailed={error === 'payment_failed'}
            summary={{
              subtotal: totals.subtotal,
              shipping: totals.shipping,
              total: totals.total,
              symbol,
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
