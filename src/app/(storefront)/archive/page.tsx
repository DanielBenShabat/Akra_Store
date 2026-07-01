import type { Metadata } from 'next';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getArchiveProducts, getCategories } from '@/lib/data-store';
import { getPageBackgroundStyle } from '@/lib/page-background-style';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = { title: 'Archive' };

export default async function ArchivePage() {
  const [products, categories, settings] = await Promise.all([
    getArchiveProducts(),
    getCategories(),
    getSiteSettings(),
  ]);
  const productsByCategory = new Map<string, typeof products>();
  for (const product of products) {
    const key = product.categoryId ?? '__archive__';
    if (!productsByCategory.has(key)) productsByCategory.set(key, []);
    productsByCategory.get(key)!.push(product);
  }
  const sections = [
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      products: productsByCategory.get(category.id) ?? [],
    })),
    {
      id: '__archive__',
      name: 'Archive',
      products: productsByCategory.get('__archive__') ?? [],
    },
  ].filter((section) => section.products.length > 0);

  return (
    <>
      <Header />
      <main className="flex-1" style={getPageBackgroundStyle(settings.pageBackgrounds.archive)}>
        {products.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-nav text-muted-foreground">Archive coming soon.</p>
          </div>
        ) : (
          <div className="py-8 flex flex-col gap-10">
            {sections.map((section) => (
              <section key={section.id} aria-labelledby={`archive-${section.id}`}>
                <h2 id={`archive-${section.id}`} className="px-4 pb-3 text-nav font-bold uppercase tracking-nav">
                  {section.name}
                </h2>

                <div
                  className="flex overflow-x-auto gap-3 pl-4 pr-8 pb-4 scrollbar-none"
                  style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                >
                  {section.products.map((product) => (
                    <div
                      key={product.id}
                      className="shrink-0 w-44 flex flex-col gap-2 rounded-sm"
                    >
                      <div className="relative aspect-[3/4] w-full bg-border overflow-hidden">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="176px"
                          />
                        ) : (
                          <div className="w-full h-full bg-border" aria-hidden="true" />
                        )}
                      </div>
                      <p className="text-nav font-medium leading-snug line-clamp-2">
                        {product.name}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
