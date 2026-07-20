import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getOrderPaymentDetails } from '@/lib/data-store';
import { getSiteSettings } from '@/lib/site-settings';
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
  const settings = await getSiteSettings();
  const deliveryLink = settings.shipping.deliveryPaymentLink;
  // A positive shipping charge means Standard delivery was chosen.
  const needsDeliveryPayment = order.shipping > 0;

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
            confirm your payment, we&apos;ll email you and arrange delivery or pickup.
          </p>

          <ol className="flex flex-col gap-4">
            {order.items.map((item, index) => (
              <li key={item.productId} className="border border-border p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-nav font-medium leading-snug">
                      {index + 1}. {item.name}
                    </p>
                    <p className="text-badge text-muted-foreground">Size: {item.size}</p>
                  </div>
                  <span className="text-nav font-bold whitespace-nowrap">
                    {formatPrice(item.price, symbol)}
                  </span>
                </div>
                {item.paymentLink ? (
                  <a
                    href={item.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav py-3 text-center hover:bg-foreground/90 transition-colors"
                  >
                    Pay {formatPrice(item.price, symbol)}
                  </a>
                ) : (
                  <p className="text-badge text-accent-warning border border-accent-warning/40 p-3">
                    This item has no payment link yet — please contact us to complete your purchase.
                  </p>
                )}
              </li>
            ))}

            {needsDeliveryPayment && (
              <li className="border border-border p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-nav font-medium leading-snug">
                      {order.items.length + 1}. Standard Delivery
                    </p>
                    <p className="text-badge text-muted-foreground">Courier to your address</p>
                  </div>
                  <span className="text-nav font-bold whitespace-nowrap">
                    {formatPrice(order.shipping, symbol)}
                  </span>
                </div>
                {deliveryLink ? (
                  <a
                    href={deliveryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav py-3 text-center hover:bg-foreground/90 transition-colors"
                  >
                    Pay {formatPrice(order.shipping, symbol)}
                  </a>
                ) : (
                  <p className="text-badge text-muted-foreground border border-border p-3">
                    We&apos;ll arrange the delivery fee with you directly after your items are paid.
                  </p>
                )}
              </li>
            )}
          </ol>

          <dl className="mt-8 flex flex-col divide-y divide-border border-t border-b border-border">
            <div className="flex items-center justify-between py-3">
              <dt className="text-nav uppercase tracking-nav text-muted-foreground">Subtotal</dt>
              <dd className="text-nav">{formatPrice(order.subtotal, symbol)}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-nav uppercase tracking-nav text-muted-foreground">Shipping</dt>
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
