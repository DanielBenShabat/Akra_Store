'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { createPendingOrderAction } from './actions';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(9, 'Enter a valid phone number'),
  address: z.string().min(5, 'Enter your full address'),
  city: z.string().min(1, 'Required'),
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

interface Props {
  productId: string;
  size: string;
  paymentFailed: boolean;
  summary: { subtotal: number; shipping: number; total: number; symbol: string };
}

export function CheckoutForm({ productId, size, paymentFailed, summary }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (paymentFailed) toast.error('Payment was not completed. Please try again.');
  }, [paymentFailed]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema) });

  async function onSubmit(data: CheckoutFormValues) {
    const result = await createPendingOrderAction({ productId, size, shipping: data });

    if (result.error || !result.orderId) {
      toast.error(result.error ?? 'Something went wrong');
      return;
    }

    const params = new URLSearchParams({ orderId: result.orderId, productId, size });
    router.push(`/mock-payment?${params.toString()}`);
  }

  return (
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

      <div className="border-t border-border pt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-nav text-muted-foreground uppercase tracking-nav">Subtotal</span>
          <span className="text-nav">{formatPrice(summary.subtotal, summary.symbol)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-nav text-muted-foreground uppercase tracking-nav">Shipping</span>
          <span className="text-nav">
            {summary.shipping === 0 ? 'Free' : formatPrice(summary.shipping, summary.symbol)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
          <span className="text-nav font-bold uppercase tracking-nav">Total</span>
          <span className="text-price font-bold">{formatPrice(summary.total, summary.symbol)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav py-4 hover:bg-foreground/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
      >
        {isSubmitting ? 'Processing…' : `Continue to Payment · ${formatPrice(summary.total, summary.symbol)}`}
      </button>

      <Link
        href="/"
        className="text-badge text-muted-foreground uppercase tracking-nav underline underline-offset-4 hover:text-foreground transition-colors text-center"
      >
        ← Continue Shopping
      </Link>
    </form>
  );
}
