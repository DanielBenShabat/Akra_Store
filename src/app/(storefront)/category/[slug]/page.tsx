import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { getCategoriesWithProducts } from '@/lib/data-store';

async function getCategory(slug: string) {
  const categories = await getCategoriesWithProducts();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  return { title: category ? category.name : 'Collection' };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="px-4 py-8">
          <h1 className="text-page-title font-bold uppercase tracking-section mb-6">
            {category.name}
          </h1>

          {category.products.length === 0 ? (
            <p className="text-nav text-muted-foreground">Coming soon.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Link
            href="/available"
            className="mt-10 inline-block text-badge text-muted-foreground uppercase tracking-nav underline underline-offset-4 hover:text-foreground transition-colors"
          >
            ← All collections
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
