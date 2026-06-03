import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <article className="flex flex-col gap-5">
      <h1 className="text-section-title font-bold uppercase tracking-section">Privacy Policy</h1>
      <p className="text-badge text-muted-foreground border border-border px-4 py-3">
        Placeholder content. Final policy will be provided before launch. This is not legal advice.
      </p>

      <h2 className="text-product-title font-bold mt-4">1. Information We Collect</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        When you place an order we collect your name, email, phone number, and shipping address,
        along with the details of the items purchased.
      </p>

      <h2 className="text-product-title font-bold mt-4">2. How We Use It</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        We use this information to process orders, arrange delivery, and provide customer support.
      </p>

      <h2 className="text-product-title font-bold mt-4">3. Payment Data</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        Card details are handled by our payment processor and are never stored on our servers.
      </p>

      <h2 className="text-product-title font-bold mt-4">4. Data Storage</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        Order data is stored securely with our hosting and database providers and retained only as
        long as needed for business and legal purposes.
      </p>

      <h2 className="text-product-title font-bold mt-4">5. Your Rights</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        You may request access to or deletion of your personal data through our contact page.
      </p>
    </article>
  );
}
