export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full bg-surface-dark flex items-end justify-start h-[80vh]"
    >
      <h1 id="hero-heading" className="sr-only">Akra The Duck</h1>
      <div className="p-8 pb-10">
        <p className="text-on-dark text-5xl font-bold uppercase leading-none tracking-tight">
          Akra
        </p>
        <p className="text-on-dark/50 text-sm uppercase tracking-[0.35em] mt-2">
          The Duck
        </p>
      </div>
    </section>
  );
}
