import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getOrderById } from '@/lib/data-store';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { SuccessClient } from './SuccessClient';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ order?: string }>;
}

type View = 'confirmed' | 'pending' | 'failed' | 'unknown';

function resolveView(status: string | undefined): View {
  if (status === 'confirmed') return 'confirmed';
  if (status === 'pending') return 'pending';
  if (status === 'cancelled') return 'failed';
  return 'unknown';
}

const copy: Record<View, { title: string; body: string }> = {
  confirmed: {
    title: 'Payment Confirmed',
    body: 'Thank you for your order. A confirmation has been sent to your email.',
  },
  pending: {
    title: 'Processing Payment…',
    body: 'We are confirming your payment with the gateway. This page will update automatically.',
  },
  failed: {
    title: 'Payment Not Completed',
    body: 'Your payment was not completed and the order was cancelled. You can try again.',
  },
  unknown: {
    title: 'Order Received',
    body: 'Thank you for your order. A confirmation will follow by email.',
  },
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order: orderId } = await searchParams;
  const order = orderId ? await getOrderById(orderId) : null;
  const view = resolveView(order?.status);
  const text = copy[view];

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="site-container py-20 flex flex-col items-center text-center gap-6">
          {order && <SuccessClient status={order.status} productIds={order.productIds} />}

          <div className="w-16 h-px bg-foreground" aria-hidden="true" />

          <h1 className="text-section-title font-bold uppercase tracking-section">{text.title}</h1>

          <p className="text-nav text-muted-foreground leading-relaxed">{text.body}</p>

          {order && (
            <dl className="w-full flex flex-col divide-y divide-border border-t border-b border-border">
              <div className="flex items-center justify-between py-3">
                <dt className="text-nav uppercase tracking-nav text-muted-foreground">Order</dt>
                <dd className="text-nav font-medium">#{order.id.slice(0, 8)}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-nav uppercase tracking-nav text-muted-foreground">
                  {view === 'confirmed' ? 'Total Paid' : 'Order Total'}
                </dt>
                <dd className="text-nav font-bold">
                  {formatPrice(order.total, siteConfig.currency.symbol)}
                </dd>
              </div>
            </dl>
          )}

          {view === 'failed' ? (
            <Link
              href="/checkout"
              className="text-nav font-medium uppercase tracking-nav underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Return to Checkout
            </Link>
          ) : (
            <Link
              href="/"
              className="text-nav font-medium uppercase tracking-nav underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Continue Shopping
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
