import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'Available' };

export default function AvailablePage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="site-container py-20 flex flex-col items-center text-center gap-4">
          <h1 className="text-section-title font-bold uppercase tracking-section">Available</h1>
          <p className="text-nav text-muted-foreground">Current collection coming soon.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
