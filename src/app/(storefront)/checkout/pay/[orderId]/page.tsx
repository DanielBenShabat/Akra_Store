import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getOrderPaymentDetails } from '@/lib/data-store';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function PayPage({ params }: Props) {
  const { orderId } = await params;
  const order = await getOrderPaymentDetails(orderId);
  if (!order) notFound();

  // Only pending orders need payment. Anything else is resolved on the success
  // page (confirmed receipt, or cancelled/failed notice).
  if (order.status !== 'pending') {
    redirect(`/checkout/success?order=${orderId}`);
  }

  const symbol = siteConfig.currency.symbol;
  const isDelivery = order.shippingMethod === 'standard';

  // The delivery fee is charged once per order by paying the FIRST item via its
  // "with delivery" Grow link (item price + fee). Every other item — and all
  // items on a pickup order — uses its item-only link.
  const lines = order.items.map((item, index) => {
    const useDelivery = isDelivery && index === 0;
    return {
      ...item,
      includesDelivery: useDelivery,
      link: useDelivery ? item.deliveryLink : item.pickupLink,
      amount: useDelivery ? item.price + order.shipping : item.price,
    };
  });

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="site-container py-10 max-w-xl">
          <h1 className="text-page-title font-bold uppercase tracking-section mb-2">
            Complete Your Payment
          </h1>
          <p className="text-badge text-muted-foreground uppercase tracking-nav mb-8">
            Order #{order.id.slice(0, 8)} · reserved for you
          </p>

          <p className="text-nav text-muted-foreground leading-relaxed mb-8">
            Pay for each item below using its secure Grow link. Payments open in a new tab. Once we
            confirm your payment, we&apos;ll email you and arrange {isDelivery ? 'delivery' : 'pickup'}.
          </p>

          <ol className="flex flex-col gap-4">
            {lines.map((line, index) => (
              <li key={line.productId} className="border border-border p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-nav font-medium leading-snug">
                      {index + 1}. {line.name}
                    </p>
                    <p className="text-badge text-muted-foreground">
                      Size: {line.size}
                      {line.includesDelivery && ` · includes ${formatPrice(order.shipping, symbol)} delivery`}
                    </p>
                  </div>
                  <span className="text-nav font-bold whitespace-nowrap">
                    {formatPrice(line.amount, symbol)}
                  </span>
                </div>
                {line.link ? (
                  <a
                    href={line.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav py-3 text-center hover:bg-foreground/90 transition-colors"
                  >
                    Pay {formatPrice(line.amount, symbol)}
                  </a>
                ) : (
                  <p className="text-badge text-accent-warning border border-accent-warning/40 p-3">
                    This item has no payment link yet — please contact us to complete your purchase.
                  </p>
                )}
              </li>
            ))}
          </ol>

          <dl className="mt-8 flex flex-col divide-y divide-border border-t border-b border-border">
            <div className="flex items-center justify-between py-3">
              <dt className="text-nav uppercase tracking-nav text-muted-foreground">Subtotal</dt>
              <dd className="text-nav">{formatPrice(order.subtotal, symbol)}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-nav uppercase tracking-nav text-muted-foreground">
                {isDelivery ? 'Delivery' : 'Pickup'}
              </dt>
              <dd className="text-nav">
                {order.shipping === 0 ? 'Free' : formatPrice(order.shipping, symbol)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-nav font-bold uppercase tracking-nav">Total</dt>
              <dd className="text-price font-bold">{formatPrice(order.total, symbol)}</dd>
            </div>
          </dl>

          <Link
            href={`/checkout/success?order=${order.id}`}
            className="mt-8 block text-badge text-muted-foreground uppercase tracking-nav underline underline-offset-4 hover:text-foreground transition-colors text-center"
          >
            View order status
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
