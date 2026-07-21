'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { cartSubtotal } from '@/lib/cart-store';
import { track } from '@/lib/track';
import { ISRAELI_CITIES, isValidCity } from '@/lib/israeli-cities';
import type { CartItem, ShippingMethod } from '@/types';
import type { ShippingSettings } from '@/lib/site-settings';
import { createPendingOrderAction, quoteOrderAction } from './actions';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(9, 'Enter a valid phone number'),
  city: z.string().refine(isValidCity, 'Select your city'),
  street: z.string().min(2, 'Enter your street'),
  houseNumber: z.string().min(1, 'Required'),
  postalCode: z
    .string()
    .regex(/^\d{5,7}$/, 'Enter a valid postal code')
    .optional()
    .or(z.literal('')),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface Totals {
  subtotal: number;
  shipping: number;
  total: number;
}

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

interface Props {
  items: CartItem[];
  symbol: string;
  shippingSettings: ShippingSettings;
  paymentFailed: boolean;
  buyNowProductId: string | null;
}

export function CheckoutForm({ items, symbol, shippingSettings, paymentFailed, buyNowProductId }: Props) {
  const productIds = items.map((i) => i.productId);

  // Server is the source of truth for totals. Seed both methods with a client
  // estimate, then quote each from the server on mount / when items change.
  const estimatedSubtotal = cartSubtotal(items);
  const seed: Totals = { subtotal: estimatedSubtotal, shipping: 0, total: estimatedSubtotal };
  const [pickupTotals, setPickupTotals] = useState<Totals>(seed);
  const [deliveryTotals, setDeliveryTotals] = useState<Totals>({
    ...seed,
    shipping: shippingSettings.standardFee,
    total: estimatedSubtotal + shippingSettings.standardFee,
  });
  const [quoting, setQuoting] = useState(true);

  useEffect(() => {
    if (paymentFailed) toast.error('Payment was not completed. Please try again.');
  }, [paymentFailed]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema) });

  const productIdsKey = productIds.join(',');

  useEffect(() => {
    let active = true;
    setQuoting(true);
    const ids = productIdsKey.split(',');
    Promise.all([
      quoteOrderAction({ productIds: ids, shippingMethod: 'pickup' }),
      quoteOrderAction({ productIds: ids, shippingMethod: 'standard' }),
    ])
      .then(([pickup, delivery]) => {
        if (!active) return;
        if (pickup.error || delivery.error) {
          toast.error(pickup.error ?? delivery.error ?? 'Could not calculate totals');
          return;
        }
        setPickupTotals({ subtotal: pickup.subtotal, shipping: pickup.shipping, total: pickup.total });
        setDeliveryTotals({ subtotal: delivery.subtotal, shipping: delivery.shipping, total: delivery.total });
      })
      .finally(() => {
        if (active) setQuoting(false);
      });

    return () => {
      active = false;
    };
  }, [productIdsKey]);

  async function submitWithMethod(data: CheckoutFormValues, method: ShippingMethod) {
    const total = method === 'standard' ? deliveryTotals.total : pickupTotals.total;
    // Funnel: fired once the form validates and the shopper commits to paying.
    track('checkout-submit', { items: items.length, value: total, method });

    const result = await createPendingOrderAction({
      items: items.map((i) => ({ productId: i.productId, size: i.size })),
      shippingMethod: method,
      buyNowProductId: buyNowProductId ?? undefined,
      shipping: data,
    });

    if (result.error || !result.redirectUrl) {
      toast.error(result.error ?? 'Something went wrong');
      return;
    }

    // The cart is intentionally NOT cleared here — the order is only 'pending'.
    // It is purged on the success page once payment is confirmed, so an
    // abandoned/failed payment keeps the cart intact.
    window.location.assign(result.redirectUrl);
  }

  const busy = quoting || isSubmitting;

  return (
    <form className="flex flex-col gap-6">
      <p className="text-nav font-bold uppercase tracking-nav border-b border-border pb-3">
        Order Summary
      </p>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.productId} className="border border-border p-3 flex gap-3">
            <div className="relative w-16 h-16 shrink-0 bg-border overflow-hidden">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="w-full h-full bg-border" aria-hidden="true" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-nav font-medium leading-snug truncate">{item.name}</p>
              <p className="text-badge text-muted-foreground">Size: {item.size} · Qty: 1</p>
            </div>
            <span className="text-nav font-bold self-center whitespace-nowrap">
              {formatPrice(item.price, symbol)}
            </span>
          </li>
        ))}
      </ul>

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

      <Field label="City" error={errors.city?.message}>
        <select className={inputClass} defaultValue="" {...register('city')}>
          <option value="" disabled>
            Select a city
          </option>
          {ISRAELI_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-[1fr_auto] gap-4">
        <Field label="Street" error={errors.street?.message}>
          <input className={inputClass} placeholder="Dizengoff" {...register('street')} />
        </Field>
        <Field label="No." error={errors.houseNumber?.message}>
          <input className={`${inputClass} w-24`} placeholder="123" {...register('houseNumber')} />
        </Field>
      </div>

      <Field label="Postal Code (optional)" error={errors.postalCode?.message}>
        <input className={inputClass} inputMode="numeric" placeholder="6100000" {...register('postalCode')} />
      </Field>

      <p className="text-nav font-bold uppercase tracking-nav border-b border-border pb-3">
        Choose How to Pay
      </p>

      <div className="border-t border-border pt-4 flex items-center justify-between">
        <span className="text-nav text-muted-foreground uppercase tracking-nav">Subtotal</span>
        <span className="text-nav">{formatPrice(pickupTotals.subtotal, symbol)}</span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Delivery — pays the item's "with delivery" Grow link (item + delivery fee). */}
        <button
          type="button"
          disabled={busy}
          onClick={handleSubmit((data) => submitWithMethod(data, 'standard'))}
          className="w-full bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav py-4 hover:bg-foreground/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
        >
          <span className="flex items-center justify-between px-4">
            <span>Pay with Delivery</span>
            <span>{quoting ? '…' : formatPrice(deliveryTotals.total, symbol)}</span>
          </span>
        </button>
        <p className="text-badge text-muted-foreground text-center">
          Standard courier · delivery fee {formatPrice(deliveryTotals.shipping, symbol)} included
        </p>

        {/* Pickup — pays the item's item-only Grow link. */}
        <button
          type="button"
          disabled={busy}
          onClick={handleSubmit((data) => submitWithMethod(data, 'pickup'))}
          className="w-full border border-foreground text-foreground text-nav font-medium uppercase tracking-nav py-4 hover:bg-foreground hover:text-on-dark transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
        >
          <span className="flex items-center justify-between px-4">
            <span>Pay for Self Pick-up</span>
            <span>{quoting ? '…' : formatPrice(pickupTotals.total, symbol)}</span>
          </span>
        </button>
        <p className="text-badge text-muted-foreground text-center">
          Modi&apos;in area, by prior arrangement · no delivery fee
        </p>
      </div>

      <Link
        href="/"
        className="text-badge text-muted-foreground uppercase tracking-nav underline underline-offset-4 hover:text-foreground transition-colors text-center"
      >
        ← Continue Shopping
      </Link>
    </form>
  );
}
