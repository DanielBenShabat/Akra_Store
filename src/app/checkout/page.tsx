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
import { siteConfig } from '@/config/site';
import { placeOrderAction } from './actions';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  email:     z.string().email('Enter a valid email'),
  phone:     z.string().min(9, 'Enter a valid phone number'),
  address:   z.string().min(5, 'Enter your full address'),
  city:      z.string().min(1, 'Required'),
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

  async function onSubmit(data: CheckoutFormValues) {
    const result = await placeOrderAction(data, items);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    clearCart();
    router.push('/checkout/success');
  }

  if (items.length === 0) return null;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="site-container py-10 lg:py-16">
          <h1 className="text-section-title font-bold uppercase tracking-section mb-10">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16">
            {/* ── Shipping form ── */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <p className="text-nav font-bold uppercase tracking-nav border-b border-border pb-3">
                Shipping Details
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" error={errors.firstName?.message}>
                  <input className={inputClass} placeholder="Daniel" {...register('firstName')} />
                </Field>
                <Field label="Last Name" error={errors.lastName?.message}>
                  <input className={inputClass} placeholder="Cohen" {...register('lastName')} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email" error={errors.email?.message}>
                  <input className={inputClass} type="email" placeholder="you@email.com" {...register('email')} />
                </Field>
                <Field label="Phone" error={errors.phone?.message}>
                  <input className={inputClass} type="tel" placeholder="050-000-0000" {...register('phone')} />
                </Field>
              </div>

              <Field label="Address" error={errors.address?.message}>
                <input className={inputClass} placeholder="123 Dizengoff St, Apt 4" {...register('address')} />
              </Field>

              <Field label="City" error={errors.city?.message}>
                <input className={inputClass} placeholder="Tel Aviv" {...register('city')} />
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav py-4 hover:bg-foreground/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
              >
                {isSubmitting ? 'Placing Order…' : 'Complete Order'}
              </button>
            </form>

            {/* ── Order summary ── */}
            <div className="flex flex-col gap-6">
              <p className="text-nav font-bold uppercase tracking-nav border-b border-border pb-3">
                Order Summary
              </p>

              <ul className="flex flex-col divide-y divide-border">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.size}`} className="flex gap-4 py-4">
                    <div className="relative w-16 h-16 shrink-0 bg-border overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-border" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <p className="text-nav font-medium">{item.name}</p>
                      <p className="text-badge text-muted-foreground">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-nav font-bold shrink-0">
                      {formatPrice(item.price * item.quantity, siteConfig.currency.symbol)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="text-nav text-muted-foreground uppercase tracking-nav">Subtotal</span>
                <span className="text-price font-bold">
                  {formatPrice(subtotal(), siteConfig.currency.symbol)}
                </span>
              </div>

              <p className="text-badge text-muted-foreground leading-relaxed">
                Payment will be arranged upon order confirmation. A member of our team will be
                in touch shortly.
              </p>
            </div>
          </div>

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
