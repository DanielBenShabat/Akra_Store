import { TopBar } from './TopBar';
import { getSiteSettings } from '@/lib/site-settings';

export async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 bg-background">
      <TopBar topLogoUrl={settings.topLogo.url} />
    </header>
  );
}
