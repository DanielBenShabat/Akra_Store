import { Logo } from '@/components/layout/Logo';

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full bg-surface-dark flex items-end justify-start h-[80vh]"
    >
      <h1 id="hero-heading" className="sr-only">AKRA</h1>
      <div className="p-8 pb-10">
        <Logo height={120} priority />
      </div>
    </section>
  );
}
