import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteSettings } from '@/lib/site-settings';
import { getPageBackgroundStyle } from '@/lib/page-background-style';

export const metadata: Metadata = { title: 'Contact' };

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const content = settings.content.contact;
  const bg = settings.pageBackgrounds.contact;

  return (
    <>
      <Header />
      <main className="flex-1" style={getPageBackgroundStyle(bg)}>
        <div className="site-container py-10 flex flex-col gap-5">
          <h1 className="text-page-title font-bold uppercase tracking-section">{content.title}</h1>
          <p className="text-body text-muted-foreground leading-relaxed">{content.intro}</p>

          <dl className="flex flex-col divide-y divide-border border-t border-b border-border">
            <div className="flex items-center justify-between py-4">
              <dt className="text-nav uppercase tracking-nav text-muted-foreground">{content.whatsappLabel}</dt>
              <dd>
                <a
                  href={content.whatsappHref}
                  className="text-nav font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message us
                </a>
              </dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="text-nav uppercase tracking-nav text-muted-foreground">Email</dt>
              <dd className="text-nav font-medium">{content.email}</dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="text-nav uppercase tracking-nav text-muted-foreground">Business ID</dt>
              <dd className="text-nav font-medium">{content.businessId}</dd>
            </div>
          </dl>
        </div>
      </main>
      <Footer />
    </>
  );
}
