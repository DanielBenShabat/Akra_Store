import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'Archive' };

export default function ArchivePage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="site-container py-20 flex flex-col items-center text-center gap-4">
          <h1 className="text-section-title font-bold uppercase tracking-section">Archive</h1>
          <p className="text-nav text-muted-foreground">Past collections coming soon.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
