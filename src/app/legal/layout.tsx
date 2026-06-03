import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="site-container py-10 lg:py-16 max-w-3xl">{children}</div>
      </main>
      <Footer />
    </>
  );
}
