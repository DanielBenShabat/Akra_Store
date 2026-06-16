import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="site-container py-10 flex flex-col gap-6">
          <h1 className="text-section-title font-bold uppercase tracking-section">About</h1>
          <p className="text-nav text-muted-foreground leading-relaxed">
            Life happens in a random kind of way. If you make room for randomness in your life, to
            the unexpected things — you discover and experience wonderful things. And that philosophy
            gives me, bar, the place to create straight from my heart, to my hands. No stops on the
            way.
          </p>
          <p className="text-nav text-muted-foreground leading-relaxed">
            The constant insistence to not follow up a line, or a knot that I&apos;ve already created
            is what gives me the way to create my unique pieces of wearable art.
          </p>
          <p className="text-nav text-muted-foreground leading-relaxed">
            Akra puts a spotlight on how I felt the day, the hour, the minute I decided to create.
          </p>
          <p className="text-nav text-muted-foreground leading-relaxed">
            A huge mix of feelings straight from my mind, onto my hands to your closet.
          </p>
          <p className="text-nav text-muted-foreground leading-relaxed">
            Every piece looks completely different on each body.
          </p>
          <p className="text-nav text-muted-foreground leading-relaxed">
            When you buy AKRA, you buy more than art — you buy your random self expression. The
            unexpected. Life itself.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
