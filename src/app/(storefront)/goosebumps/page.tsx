import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'Goosebumps' };

export default function GoosebumpsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="site-container py-20 flex flex-col items-center text-center gap-4">
          <h1 className="text-section-title font-bold uppercase tracking-section">Goosebumps</h1>
          <p className="text-nav text-muted-foreground">Coming soon.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
