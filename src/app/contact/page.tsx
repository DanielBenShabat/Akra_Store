import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="site-container py-10 lg:py-16 max-w-3xl flex flex-col gap-5">
          <h1 className="text-section-title font-bold uppercase tracking-section">Contact</h1>
          <p className="text-nav text-muted-foreground leading-relaxed">
            Questions about an order, a product, or a return? Reach us through the channels below.
          </p>

          <dl className="flex flex-col divide-y divide-border border-t border-b border-border">
            <div className="flex items-center justify-between py-4">
              <dt className="text-nav uppercase tracking-nav text-muted-foreground">WhatsApp</dt>
              <dd>
                <a
                  href={siteConfig.social.whatsappHref}
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
              <dd className="text-nav font-medium">hello@akra.example</dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="text-nav uppercase tracking-nav text-muted-foreground">Business ID</dt>
              <dd className="text-nav font-medium">To be provided</dd>
            </div>
          </dl>

          <p className="text-badge text-muted-foreground">
            Placeholder business details. Final contact information will be provided before launch.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
