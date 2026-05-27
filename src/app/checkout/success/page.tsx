import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="site-container py-20 flex flex-col items-center text-center gap-6 max-w-lg">
          <div className="w-16 h-px bg-foreground" aria-hidden="true" />

          <h1 className="text-section-title font-bold uppercase tracking-section">
            Order Received
          </h1>

          <p className="text-product-title text-muted-foreground leading-relaxed">
            Thank you for your order. We have received your request and a member of our team
            will be in touch shortly to confirm the details.
          </p>

          <div className="w-16 h-px bg-border" aria-hidden="true" />

          <Link
            href="/"
            className="text-nav font-medium uppercase tracking-nav underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
