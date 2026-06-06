import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Return and Cancellation Policy' };

export default function ReturnsPage() {
  return (
    <article className="flex flex-col gap-5">
      <h1 className="text-section-title font-bold uppercase tracking-section">
        Return and Cancellation Policy
      </h1>
      <p className="text-badge text-muted-foreground border border-border px-4 py-3">
        Placeholder content. Final policy will be provided before launch. This is not legal advice.
      </p>

      <h2 className="text-product-title font-bold mt-4">1. Cancellation Rights</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        In accordance with the Israeli Consumer Protection Law, you may cancel a purchase within the
        statutory period after receiving the item.
      </p>

      <h2 className="text-product-title font-bold mt-4">2. Condition of Items</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        Returned items must be unused, unwashed, and in their original condition with tags attached.
      </p>

      <h2 className="text-product-title font-bold mt-4">3. How to Return</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        To start a return, contact us through the contact page with your order number.
      </p>

      <h2 className="text-product-title font-bold mt-4">4. Refunds</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        Approved refunds are issued to the original payment method.
      </p>
    </article>
  );
}
