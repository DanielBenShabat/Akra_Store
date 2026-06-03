import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="site-container py-20 flex flex-col items-center text-center gap-6 max-w-lg">
          <div className="w-16 h-px bg-foreground" aria-hidden="true" />
          <h1 className="text-section-title font-bold uppercase tracking-section">Page Not Found</h1>
          <p className="text-product-title text-muted-foreground leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="text-nav font-medium uppercase tracking-nav underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
