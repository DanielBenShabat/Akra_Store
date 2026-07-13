import Script from 'next/script';
import { NavProvider } from '@/components/layout/NavContext';
import { NavDrawer } from '@/components/layout/NavDrawer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { getSiteSettings } from '@/lib/site-settings';
import { getTypographyVars } from '@/lib/typography-utils';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const navItems = settings.navigation.items
    .filter((item) => item.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((item) => ({ label: item.label, href: item.href }));

  const typographyStyle = getTypographyVars(settings.typography);

  // Umami visitor analytics — storefront only (this layout excludes /admin),
  // so the owner's admin work doesn't pollute the numbers.
  const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  return (
    <NavProvider>
      {umamiSrc && umamiWebsiteId && (
        <Script src={umamiSrc} data-website-id={umamiWebsiteId} strategy="afterInteractive" />
      )}
      <div
        className="max-w-[430px] mx-auto min-h-screen relative bg-background shadow-2xl flex flex-col"
        style={typographyStyle}
      >
        {children}
        <NavDrawer items={navItems} closeIconUrl={settings.icons.close.url} />
        <CartDrawer />
      </div>
    </NavProvider>
  );
}
