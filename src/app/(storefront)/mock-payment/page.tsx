import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getOrderById } from '@/lib/data-store';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { MockPaymentClient } from './MockPaymentClient';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ orderId?: string; productId?: string }>;
}

export default async function MockPaymentPage({ searchParams }: Props) {
  const { orderId, productId } = await searchParams;
  if (!orderId) redirect('/');

  const order = await getOrderById(orderId);
  if (!order) redirect('/');
  if (order.status === 'confirmed') redirect(`/checkout/success?order=${orderId}`);

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="site-container py-16 flex justify-center">
          <div className="w-full max-w-md border border-border p-6 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-badge uppercase tracking-nav text-muted-foreground">
                Grow Secure Payment
              </span>
              <span className="text-nav font-bold uppercase tracking-nav">Sandbox Gateway</span>
            </div>

            <div className="flex items-center justify-between border-t border-b border-border py-4">
              <span className="text-nav uppercase tracking-nav text-muted-foreground">Amount Due</span>
              <span className="text-price font-bold">
                {formatPrice(order.total, siteConfig.currency.symbol)}
              </span>
            </div>

            <MockPaymentClient orderId={orderId} productId={productId ?? null} />

            <p className="text-badge text-muted-foreground text-center">
              Simulated gateway — no real payment is processed.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
