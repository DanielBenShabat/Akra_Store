import Link from 'next/link';
import { siteConfig } from '@/config/site';

const footerLinks = [
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Returns', href: '/legal/returns' },
  { label: 'Accessibility', href: '/legal/accessibility' },
  { label: 'Contact', href: '/contact' },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="site-container flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-nav font-bold uppercase tracking-nav">{siteConfig.brandName}</span>

        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-badge uppercase tracking-nav text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <span className="text-badge text-muted-foreground">{siteConfig.footer.copyright}</span>
      </div>
    </footer>
  );
}
