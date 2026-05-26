import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function MainNav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-border">
      <div className="overflow-x-auto scrollbar-none">
        <ul
          role="list"
          className="flex items-center justify-center h-mainnav gap-6 md:gap-8 px-4 min-w-max mx-auto"
        >
          {siteConfig.nav.map((item) => (
            <li key={item.label} className="shrink-0">
              <Link
                href={item.href}
                className="text-nav font-medium uppercase tracking-nav text-foreground hover:text-muted-foreground transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
