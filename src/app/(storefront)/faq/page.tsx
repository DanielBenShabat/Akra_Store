import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getPageBackgroundStyle } from '@/lib/page-background-style';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = { title: 'FAQ' };

const faqs = [
  {
    q: 'How long does shipping take?',
    a: 'Standard delivery within Israel takes 3–5 business days.',
  },
  {
    q: 'Can I return an item?',
    a: 'Yes. See our Returns & Cancellation Policy for full details.',
  },
  {
    q: 'What sizes are available?',
    a: 'Sizes vary by product. Check the individual product page for available sizes.',
  },
];

export default async function FaqPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Header />
      <main className="flex-1" style={getPageBackgroundStyle(settings.pageBackgrounds.faq)}>
        <div className="site-container py-10 flex flex-col gap-6">
          <h1 className="text-page-title font-bold uppercase tracking-section">FAQ</h1>
          <dl className="flex flex-col divide-y divide-border border-t border-border">
            {faqs.map((item) => (
              <div key={item.q} className="py-5 flex flex-col gap-2">
                <dt className="text-nav font-bold">{item.q}</dt>
                <dd className="text-body text-muted-foreground leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </main>
      <Footer />
    </>
  );
}
