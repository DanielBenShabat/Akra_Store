import { Logo } from '@/components/layout/Logo';
import { getSiteSettings } from '@/lib/site-settings';

export async function HeroSection() {
  const settings = await getSiteSettings();
  const heroBackgroundUrl = settings.heroBackground.url;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full bg-surface-dark flex items-end justify-start h-[80vh]"
      style={
        heroBackgroundUrl
          ? {
              backgroundImage: `url(${heroBackgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { backgroundColor: '#1a1a1a' }
      }
    >
      <h1 id="hero-heading" className="sr-only">AKRA</h1>
      <div className="p-8 pb-10">
        <Logo height={120} priority src={settings.logo.url} />
      </div>
    </section>
  );
}
