import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getOrderById } from '@/lib/data-store';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order: orderId } = await searchParams;
  const order = orderId ? await getOrderById(orderId) : null;
  const paid = order?.status === 'confirmed';

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="site-container py-20 flex flex-col items-center text-center gap-6">
          <div className="w-16 h-px bg-foreground" aria-hidden="true" />

          <h1 className="text-section-title font-bold uppercase tracking-section">
            {paid ? 'Payment Confirmed' : 'Order Received'}
          </h1>

          <p className="text-nav text-muted-foreground leading-relaxed">
            Thank you for your order. A confirmation has been sent to your email.
          </p>

          {order && (
            <dl className="w-full flex flex-col divide-y divide-border border-t border-b border-border">
              <div className="flex items-center justify-between py-3">
                <dt className="text-nav uppercase tracking-nav text-muted-foreground">Order</dt>
                <dd className="text-nav font-medium">#{order.id.slice(0, 8)}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-nav uppercase tracking-nav text-muted-foreground">Total Paid</dt>
                <dd className="text-nav font-bold">{formatPrice(order.total, siteConfig.currency.symbol)}</dd>
              </div>
            </dl>
          )}

          <Link
            href="/"
            className="text-nav font-medium uppercase tracking-nav underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
