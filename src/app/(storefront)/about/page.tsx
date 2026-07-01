import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteSettings } from '@/lib/site-settings';
import { getPageBackgroundStyle } from '@/lib/page-background-style';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const content = settings.content.about;
  const bg = settings.pageBackgrounds.about;
  const paragraphs = content.body.split('\n\n').filter(Boolean);

  return (
    <>
      <Header />
      <main className="flex-1" style={getPageBackgroundStyle(bg)}>
        <div className="site-container py-10 flex flex-col gap-6">
          <h1 className="text-page-title font-bold uppercase tracking-section">{content.title}</h1>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-body text-muted-foreground leading-relaxed">{p}</p>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
