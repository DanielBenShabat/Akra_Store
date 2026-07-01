import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { getGoosebumpsProducts } from '@/lib/data-store';
import { getPageBackgroundStyle } from '@/lib/page-background-style';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = { title: 'Goosebumps' };

export default async function GoosebumpsPage() {
  const [products, settings] = await Promise.all([getGoosebumpsProducts(), getSiteSettings()]);

  return (
    <>
      <Header />
      <main className="flex-1" style={getPageBackgroundStyle(settings.pageBackgrounds.goosebumps)}>
        <div className="px-4 py-8">
          <h1 className="text-page-title font-bold uppercase tracking-section mb-6">
            Goosebumps
          </h1>

          {products.length === 0 ? (
            <p className="text-nav text-muted-foreground italic text-center">Coming soon!!</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
