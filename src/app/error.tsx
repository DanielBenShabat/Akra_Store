'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="site-container py-20 flex flex-col items-center text-center gap-6 max-w-lg">
        <div className="w-16 h-px bg-foreground" aria-hidden="true" />
        <h1 className="text-section-title font-bold uppercase tracking-section">Something Went Wrong</h1>
        <p className="text-product-title text-muted-foreground leading-relaxed">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex items-center gap-6">
          <button
            onClick={reset}
            className="bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav px-6 py-3 hover:bg-foreground/90 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="text-nav font-medium uppercase tracking-nav underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
