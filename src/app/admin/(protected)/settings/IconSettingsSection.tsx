'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { Label } from '@/components/admin-ui/label';
import type { IconSettings, IconSlot } from '@/lib/site-settings';
import { uploadSettingImageAction, updateIconsSettingsAction } from './actions';

const ICON_SLOTS: { key: IconSlot; label: string }[] = [
  { key: 'menu', label: 'Menu / Hamburger' },
  { key: 'cart', label: 'Cart / Shopping Bag' },
  { key: 'close', label: 'Close / X' },
  { key: 'categoryArrow', label: 'Category Arrow' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'accessibility', label: 'Accessibility' },
];

interface Props {
  icons: IconSettings;
}

export default function IconSettingsSection({ icons }: Props) {
  const router = useRouter();
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);

  async function handleUpload(slot: IconSlot, file: File) {
    setPendingSlot(slot);
    try {
      // Upload image to settings/icons/ path
      const formData = new FormData();
      formData.append('key', `icons_${slot}`);
      formData.append('file', file);
      const result = await uploadSettingImageAction(formData);
      if (!result.success || !result.url) {
        toast.error(result.error ?? 'Upload failed');
        return;
      }
      // Update icons setting with new URL
      const updateForm = new FormData();
      updateForm.append('slot', slot);
      updateForm.append('url', result.url);
      const updateResult = await updateIconsSettingsAction(updateForm);
      if (updateResult.success) {
        toast.success(`${ICON_SLOTS.find((s) => s.key === slot)?.label} icon updated`);
        router.refresh();
      } else {
        toast.error(updateResult.error ?? 'Failed to save icon');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setPendingSlot(null);
    }
  }

  async function handleReset(slot: IconSlot) {
    setPendingSlot(slot);
    try {
      const formData = new FormData();
      formData.append('slot', slot);
      formData.append('url', '');
      const result = await updateIconsSettingsAction(formData);
      if (result.success) {
        toast.success(`${ICON_SLOTS.find((s) => s.key === slot)?.label} icon reset`);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to reset icon');
      }
    } catch {
      toast.error('Reset failed');
    } finally {
      setPendingSlot(null);
    }
  }

  return (
    <div className="rounded-md border border-border p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Icons</h2>
        <p className="text-sm text-muted-foreground">
          Upload custom icons for UI elements. Leave empty to use the default Lucide icons.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ICON_SLOTS.map(({ key, label }) => {
          const icon = icons[key];
          const isPending = pendingSlot === key;
          return (
            <div key={key} className="rounded-md border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{label}</Label>
                {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>

              {/* Preview */}
              <div className="w-12 h-12 rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden">
                {icon.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={icon.url} alt={label} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">Default</span>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isPending}
                  className="text-xs"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(key, file);
                    e.target.value = '';
                  }}
                />
                {icon.url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleReset(key)}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
