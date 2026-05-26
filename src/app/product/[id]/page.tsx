import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { getProductById } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="site-container py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-8 lg:gap-16">
            <ProductGallery product={product} />
            <ProductInfo product={product} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
