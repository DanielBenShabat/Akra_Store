import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <article className="flex flex-col gap-5">
      <h1 className="text-page-title font-bold uppercase tracking-section">Terms of Service</h1>
      <p className="text-badge text-muted-foreground border border-border px-4 py-3">
        Placeholder content. Final terms will be provided before launch. This is not legal advice.
      </p>

      <h2 className="text-product-title font-bold mt-4">1. Overview</h2>
      <p className="text-body text-muted-foreground leading-relaxed">
        These terms govern your use of the {siteConfig.brandName} online store and any purchase
        made through it. By placing an order you agree to these terms.
      </p>

      <h2 className="text-product-title font-bold mt-4">2. Orders and Pricing</h2>
      <p className="text-body text-muted-foreground leading-relaxed">
        All prices are listed in {siteConfig.currency.code} and include VAT where applicable.
      </p>

      <h2 className="text-product-title font-bold mt-4">3. Payment</h2>
      <p className="text-body text-muted-foreground leading-relaxed">
        Payment is processed at checkout. Orders are confirmed only after payment is approved.
      </p>

      <h2 className="text-product-title font-bold mt-4">4. Shipping</h2>
      <p className="text-body text-muted-foreground leading-relaxed">
        Delivery times and shipping fees are presented at checkout. Risk passes to you on delivery.
      </p>

      <h2 className="text-product-title font-bold mt-4">5. Governing Law</h2>
      <p className="text-body text-muted-foreground leading-relaxed">
        These terms are governed by the laws of the State of Israel.
      </p>
    </article>
  );
}
