import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="site-container flex flex-wrap items-center justify-between gap-4 py-6">
        <span className="text-nav font-bold uppercase tracking-nav">
          {siteConfig.brandName}
        </span>
        <span className="text-badge text-muted-foreground">
          {siteConfig.footer.copyright}
        </span>
      </div>
    </footer>
  );
}
