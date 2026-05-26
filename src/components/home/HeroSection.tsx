import { Placeholder } from '@/components/ui/Placeholder';
import { siteConfig } from '@/config/site';

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full bg-surface-dark flex items-center justify-center min-h-[85vh]"
    >
      <h1 id="hero-heading" className="sr-only">
        {siteConfig.brandName}
      </h1>
      <div className="w-48 sm:w-60 md:w-80 max-w-sm">
        <Placeholder aspectRatio="1/1" label="Animated logo" variant="light" />
      </div>
    </section>
  );
}
