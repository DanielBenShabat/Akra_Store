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

  return (
    <NavProvider>
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
