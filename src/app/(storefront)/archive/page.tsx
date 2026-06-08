import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getArchiveItems } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Archive' };

export default async function ArchivePage() {
  const items = await getArchiveItems();

  return (
    <>
      <Header />
      <main className="flex-1">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-nav text-muted-foreground">Archive coming soon.</p>
          </div>
        ) : (
          <div className="relative w-full min-h-[100vh] overflow-hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="absolute"
                style={{
                  left: `${item.xPosition}%`,
                  top: `${item.yPosition}%`,
                  width: `${item.size}%`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-full h-auto block select-none pointer-events-none"
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
