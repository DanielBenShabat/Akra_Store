import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Accessibility Statement' };

export default function AccessibilityPage() {
  return (
    <article className="flex flex-col gap-5">
      <h1 className="text-section-title font-bold uppercase tracking-section">
        Accessibility Statement
      </h1>
      <p className="text-badge text-muted-foreground border border-border px-4 py-3">
        Placeholder content. Final statement will be provided before launch.
      </p>

      <h2 className="text-product-title font-bold mt-4">Our Commitment</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        We are committed to making this website accessible to as many people as possible, in line
        with the Israeli accessibility regulations and the WCAG 2.1 AA guidelines.
      </p>

      <h2 className="text-product-title font-bold mt-4">Reporting Issues</h2>
      <p className="text-nav text-muted-foreground leading-relaxed">
        If you encounter an accessibility barrier, please let us know through the contact page.
      </p>
    </article>
  );
}
