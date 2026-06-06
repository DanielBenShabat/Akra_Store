import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingButtons } from '@/components/layout/FloatingButtons';
import { HeroSection } from '@/components/home/HeroSection';

export const metadata: Metadata = {
  title: { absolute: 'akra — Minimalist Streetwear' },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
