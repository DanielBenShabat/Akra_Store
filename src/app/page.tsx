import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingButtons } from '@/components/layout/FloatingButtons';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCollection } from '@/components/home/FeaturedCollection';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';
import { getProducts } from '@/lib/data-store';

export default async function HomePage() {
  const all = await getProducts();
  const featured = all.filter((p) => p.category === 'featured');
  const tees = all.filter((p) => p.category === 'tees');
  const bottoms = all.filter((p) => p.category === 'bottoms');

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
