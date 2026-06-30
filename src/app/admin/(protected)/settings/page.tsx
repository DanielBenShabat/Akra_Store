import { getSiteSettings } from '@/lib/site-settings';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage delivery prices, free delivery, logo, and homepage background.
        </p>
      </div>
      <SettingsClient settings={settings} />
    </div>
  );
}
