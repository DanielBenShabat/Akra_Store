'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { Label } from '@/components/admin-ui/label';
import { Checkbox } from '@/components/admin-ui/checkbox';
import { Separator } from '@/components/admin-ui/separator';
import type { SiteSettings } from '@/lib/site-settings';
import { uploadSizeError } from '@/lib/upload-limits';
import {
  clearSettingImageAction,
  updateShippingSettingsAction,
  uploadSettingImageAction,
} from './actions';
import IconSettingsSection from './IconSettingsSection';
import NavigationSettingsSection from './NavigationSettingsSection';
import ContentSettingsSection from './ContentSettingsSection';
import TypographySettingsSection from './TypographySettingsSection';
import BackgroundSettingsSection from './BackgroundSettingsSection';

interface Props {
  settings: SiteSettings;
}

function ImageSetting({
  title,
  settingKey,
  url,
}: {
  title: string;
  settingKey: 'logo' | 'top_logo' | 'hero_background';
  url: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function handleUpload(file: File | undefined) {
    if (!file) return;
    const sizeError = uploadSizeError(file);
    if (sizeError) {
      toast.error(sizeError);
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append('key', settingKey);
      formData.append('file', file);
      const result = await uploadSettingImageAction(formData);
      if (result.success) {
        toast.success(`${title} updated`);
        if (inputRef.current) inputRef.current.value = '';
        router.refresh();
      } else {
        toast.error(result.error ?? 'Upload failed');
      }
    });
  }

  function handleClear() {
    startTransition(async () => {
      const result = await clearSettingImageAction(settingKey);
      if (result.success) {
        toast.success(`${title} reset to default`);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Reset failed');
      }
    });
  }

  return (
    <div className="rounded-md border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">Upload an image, or leave empty to use the default.</p>
        </div>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {url ? (
        <div className="rounded-md border border-border p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={title} className="max-h-40 w-full object-contain bg-zinc-100" />
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
          Using hardcoded default.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={pending}
          onChange={(e) => handleUpload(e.target.files?.[0])}
          className="max-w-sm"
        />
        <Button type="button" variant="outline" disabled={pending || !url} onClick={handleClear}>
          Use default
        </Button>
      </div>
    </div>
  );
}

export default function SettingsClient({ settings }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [freeEnabled, setFreeEnabled] = useState(settings.shipping.freeStandardEnabled);

  function handleShippingSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateShippingSettingsAction(formData);
      if (result.success) {
        toast.success('Shipping settings updated');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update shipping settings');
      }
    });
  }

  return (
    <div className="space-y-6">
      <form action={handleShippingSubmit} className="rounded-md border border-border p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Delivery prices</h2>
          <p className="text-sm text-muted-foreground">These prices are used at checkout.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="expressFee">Express delivery ₪</Label>
            <Input id="expressFee" name="expressFee" type="number" min="0" defaultValue={settings.shipping.expressFee} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="standardFee">Standard delivery ₪</Label>
            <Input id="standardFee" name="standardFee" type="number" min="0" defaultValue={settings.shipping.standardFee} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pickupFee">Self pick-up ₪</Label>
            <Input id="pickupFee" name="pickupFee" type="number" min="0" defaultValue={settings.shipping.pickupFee} />
          </div>
        </div>

        <div className="rounded-md border border-border p-3 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              name="freeStandardEnabled"
              checked={freeEnabled}
              onCheckedChange={(value) => setFreeEnabled(value === true)}
            />
            Free standard delivery over a minimum order price
          </label>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="freeStandardThreshold">Free standard over ₪</Label>
            <Input
              id="freeStandardThreshold"
              name="freeStandardThreshold"
              type="number"
              min="0"
              disabled={!freeEnabled}
              defaultValue={settings.shipping.freeStandardThreshold}
            />
          </div>
        </div>

        <Button type="submit" disabled={pending} className="bg-foreground text-background hover:bg-foreground/90">
          {pending ? 'Saving…' : 'Save delivery settings'}
        </Button>
      </form>

      <ImageSetting title="Logo" settingKey="logo" url={settings.logo.url} />
      <ImageSetting title="Top header logo" settingKey="top_logo" url={settings.topLogo.url} />
      <ImageSetting title="Hero black background" settingKey="hero_background" url={settings.heroBackground.url} />

      <Separator />

      <IconSettingsSection icons={settings.icons} />

      <Separator />

      <NavigationSettingsSection navigation={settings.navigation} />

      <Separator />

      <ContentSettingsSection content={settings.content} />

      <Separator />

      <TypographySettingsSection typography={settings.typography} />

      <Separator />

      <BackgroundSettingsSection pageBackgrounds={settings.pageBackgrounds} />
    </div>
  );
}
