'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { calculateTotals } from '@/lib/pricing';
import { siteConfig } from '@/config/site';
import { processPayment } from './actions';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  email:     z.string().email('Enter a valid email'),
  phone:     z.string().min(9, 'Enter a valid phone number'),
  address:   z.string().min(5, 'Enter your full address'),
  city:      z.string().min(1, 'Required'),
  cardName:   z.string().min(1, 'Required'),
  cardNumber: z.string().regex(/^(\d{4}\s?){3}\d{4}$/, 'Enter a 16-digit card number'),
  expiry:     z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'MM/YY'),
  cvc:        z.string().regex(/^\d{3,4}$/, '3-4 digits'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-badge font-medium uppercase tracking-nav">{label}</label>
      {children}
      {error && <p className="text-badge text-accent-warning">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full border border-border bg-background px-4 py-3 text-nav focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.subtotal);

  useEffect(() => {
    if (items.length === 0) router.replace('/');
  }, [items, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema) });

  const totals = calculateTotals(subtotal());
  const symbol = siteConfig.currency.symbol;

  async function onSubmit(data: CheckoutFormValues) {
    const result = await processPayment({
      shipping: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
      },
      items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
    });

    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.redirectUrl) {
      window.location.assign(result.redirectUrl);
      return;
    }

    clearCart();
    router.push(`/checkout/success?order=${result.orderId}`);
  }

  if (items.length === 0) return null;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="site-container py-10">
          <h1 className="text-section-title font-bold uppercase tracking-section mb-8">Checkout</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <p className="text-nav font-bold uppercase tracking-nav border-b border-border pb-3">
              Shipping Details
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" error={errors.firstName?.message}>
                <input className={inputClass} placeholder="Daniel" {...register('firstName')} />
              </Field>
              <Field label="Last Name" error={errors.lastName?.message}>
                <input className={inputClass} placeholder="Cohen" {...register('lastName')} />
              </Field>
            </div>

            <Field label="Email" error={errors.email?.message}>
              <input className={inputClass} type="email" placeholder="you@email.com" {...register('email')} />
            </Field>

            <Field label="Phone" error={errors.phone?.message}>
              <input className={inputClass} type="tel" placeholder="050-000-0000" {...register('phone')} />
            </Field>

            <Field label="Address" error={errors.address?.message}>
              <input className={inputClass} placeholder="123 Dizengoff St, Apt 4" {...register('address')} />
            </Field>

            <Field label="City" error={errors.city?.message}>
              <input className={inputClass} placeholder="Tel Aviv" {...register('city')} />
            </Field>

            <p className="text-nav font-bold uppercase tracking-nav border-b border-border pb-3 mt-2">
              Payment
            </p>

            <Field label="Name on Card" error={errors.cardName?.message}>
              <input className={inputClass} placeholder="Daniel Cohen" {...register('cardName')} />
            </Field>

            <Field label="Card Number" error={errors.cardNumber?.message}>
              <input className={inputClass} inputMode="numeric" placeholder="4242 4242 4242 4242" {...register('cardNumber')} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Expiry" error={errors.expiry?.message}>
                <input className={inputClass} placeholder="MM/YY" {...register('expiry')} />
              </Field>
              <Field label="CVC" error={errors.cvc?.message}>
                <input className={inputClass} inputMode="numeric" placeholder="123" {...register('cvc')} />
              </Field>
            </div>

            <div className="border-t border-border pt-4 flex flex-col gap-2 mt-2">
              <ul className="flex flex-col divide-y divide-border mb-4">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.size}`} className="flex gap-3 py-3">
                    <div className="relative w-14 h-14 shrink-0 bg-border overflow-hidden">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="w-full h-full bg-border" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-nav font-medium leading-snug">{item.name}</p>
                      <p className="text-badge text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
                    </div>
                    <p className="text-nav font-bold shrink-0">{formatPrice(item.price * item.quantity, symbol)}</p>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between">
                <span className="text-nav text-muted-foreground uppercase tracking-nav">Subtotal</span>
                <span className="text-nav">{formatPrice(totals.subtotal, symbol)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-nav text-muted-foreground uppercase tracking-nav">Shipping</span>
                <span className="text-nav">
                  {totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping, symbol)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
                <span className="text-nav font-bold uppercase tracking-nav">Total</span>
                <span className="text-price font-bold">{formatPrice(totals.total, symbol)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav py-4 hover:bg-foreground/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
            >
              {isSubmitting ? 'Processing Payment…' : `Pay Now · ${formatPrice(totals.total, symbol)}`}
            </button>

            <p className="text-badge text-muted-foreground text-center">
              Demo checkout — no real payment is processed.
            </p>
          </form>

          <div className="mt-8">
            <Link
              href="/"
              className="text-badge text-muted-foreground uppercase tracking-nav underline underline-offset-4 hover:text-foreground transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
