import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="site-container py-10 flex flex-col gap-6">
          <h1 className="text-section-title font-bold uppercase tracking-section">About</h1>
          <p className="text-nav text-muted-foreground leading-relaxed">
            akra is a minimalist streetwear label — heavyweight cotton, considered cuts, and quiet
            detailing.
          </p>
          <p className="text-nav text-muted-foreground leading-relaxed">
            More to come.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
