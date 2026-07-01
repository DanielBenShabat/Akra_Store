import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCategoriesWithProducts } from '@/lib/data-store';
import { getPageBackgroundStyle } from '@/lib/page-background-style';
import { getSiteSettings } from '@/lib/site-settings';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = { title: 'Available' };

export default async function AvailablePage() {
  const [categories, settings] = await Promise.all([getCategoriesWithProducts(), getSiteSettings()]);

  return (
    <>
      <Header />
      <main className="flex-1" style={getPageBackgroundStyle(settings.pageBackgrounds.available)}>
        <div className="py-8 flex flex-col gap-10">
          {categories.length === 0 && (
            <div className="px-4 flex flex-col items-center text-center gap-2 py-20">
              <p className="text-nav text-muted-foreground">No collections available yet.</p>
            </div>
          )}

          {categories.map((cat) => (
            <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
              <h2 id={`cat-${cat.id}`} className="px-4 pb-3">
                <Link
                  href={`/category/${cat.slug}`}
                  className="group inline-flex items-center gap-1.5 text-nav font-bold uppercase tracking-nav hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
                >
                  {cat.name}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </h2>

              {cat.products.length === 0 ? (
                <p className="px-4 text-badge text-muted-foreground">Coming soon.</p>
              ) : (
                <div
                  className="flex overflow-x-auto gap-3 pl-4 pr-8 pb-4 scrollbar-none"
                  style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                >
                  {cat.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="shrink-0 w-44 flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
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
                      <div className="flex flex-col gap-0.5">
                        <p className="text-nav font-medium leading-snug line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-badge text-muted-foreground">
                          {formatPrice(product.price, siteConfig.currency.symbol)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
