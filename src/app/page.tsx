import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingButtons } from '@/components/layout/FloatingButtons';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCollection } from '@/components/home/FeaturedCollection';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';
import { featured, tees, bottoms } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedCollection products={featured} viewAllHref="/" />
        <CategoryCarousel title="TEES" products={tees} viewAllHref="/" />
        <CategoryCarousel title="BOTTOMS" products={bottoms} viewAllHref="/" />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
