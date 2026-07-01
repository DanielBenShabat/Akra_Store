'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { Label } from '@/components/admin-ui/label';
import type { PageBackgroundSetting, PageBackgroundSettings } from '@/lib/site-settings';
import { uploadSettingImageAction, updatePageBackgroundsSettingsAction } from './actions';

interface Props {
  pageBackgrounds: PageBackgroundSettings;
}

const PAGE_LABELS: Record<string, string> = {
  home: 'Home',
  about: 'About',
  contact: 'Contact',
  available: 'Available',
  archive: 'Archive',
  goosebumps: 'Goosebumps',
  faq: 'FAQ',
};

const DEFAULT_BACKGROUND: PageBackgroundSetting = {
  url: null,
  mode: 'none',
  size: 'cover',
  position: 'center',
  repeat: 'no-repeat',
};

function BackgroundSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-md border border-input bg-background px-3 pr-10 text-sm transition-colors hover:border-foreground/40 hover:bg-muted/40 focus:border-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export default function BackgroundSettingsSection({ pageBackgrounds }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [backgrounds, setBackgrounds] = useState(pageBackgrounds);

  async function handleUpload(pageKey: string, file: File) {
    setUploadingKey(pageKey);
    try {
      const formData = new FormData();
      formData.append('key', `bg_${pageKey}`);
      formData.append('file', file);
      const result = await uploadSettingImageAction(formData);
      if (!result.success || !result.url) {
        toast.error(result.error ?? 'Upload failed');
        return;
      }

      const current = backgrounds[pageKey] ?? DEFAULT_BACKGROUND;
      const updated = {
        ...backgrounds,
        [pageKey]: { ...current, url: result.url, mode: 'image' as const } satisfies PageBackgroundSetting,
      };

      const payload = new FormData();
      payload.append('value', JSON.stringify(updated));
      const saveResult = await updatePageBackgroundsSettingsAction(payload);
      if (saveResult.success) {
        setBackgrounds(updated);
        toast.success(`${PAGE_LABELS[pageKey] ?? pageKey} background saved`);
        router.refresh();
      } else {
        toast.error(saveResult.error ?? 'Failed to save');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleReset(pageKey: string) {
    startTransition(async () => {
      const current = backgrounds[pageKey] ?? DEFAULT_BACKGROUND;
      const updated = {
        ...backgrounds,
        [pageKey]: { ...current, url: null, mode: 'none' as const } satisfies PageBackgroundSetting,
      };
      const payload = new FormData();
      payload.append('value', JSON.stringify(updated));
      const result = await updatePageBackgroundsSettingsAction(payload);
      if (result.success) {
        setBackgrounds(updated);
        toast.success(`${PAGE_LABELS[pageKey] ?? pageKey} background reset`);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to reset');
      }
    });
  }

  function updateProperty(pageKey: string, prop: string, val: string) {
    startTransition(async () => {
      const current = backgrounds[pageKey] ?? DEFAULT_BACKGROUND;
      const updated = {
        ...backgrounds,
        [pageKey]: { ...current, [prop]: val } as PageBackgroundSetting,
      };
      const payload = new FormData();
      payload.append('value', JSON.stringify(updated));
      const result = await updatePageBackgroundsSettingsAction(payload);
      if (result.success) {
        setBackgrounds(updated);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update');
      }
    });
  }

  return (
    <div className="rounded-md border border-border p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Page Backgrounds</h2>
        <p className="text-sm text-muted-foreground">
          Set background images and display settings per page.
        </p>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Saving…
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(PAGE_LABELS).map(([pageKey, label]) => {
          const bg = backgrounds[pageKey] ?? DEFAULT_BACKGROUND;
          const isUploading = uploadingKey === pageKey;

          return (
            <div key={pageKey} className="rounded-md border border-border p-3 space-y-2">
              <Label className="text-sm font-medium">{label}</Label>

              {/* Preview */}
              <div className="h-40 rounded-md border border-border bg-zinc-100 p-2 flex items-center justify-center overflow-hidden">
                {bg.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={bg.url}
                    alt={label}
                    className="max-h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">No image</span>
                )}
              </div>

              {/* Upload / Reset */}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  className="text-xs"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(pageKey, file);
                    e.target.value = '';
                  }}
                />
                {bg.url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending || isUploading}
                    onClick={() => handleReset(pageKey)}
                  >
                    Clear
                  </Button>
                )}
              </div>
              {isUploading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading and saving…
                </div>
              )}

              {/* Mode & display options */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Mode</Label>
                  <BackgroundSelect
                    value={bg.mode}
                    onChange={(v) => updateProperty(pageKey, 'mode', v)}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'image', label: 'Image' },
                    ]}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Size</Label>
                  <BackgroundSelect
                    value={bg.size}
                    onChange={(v) => updateProperty(pageKey, 'size', v)}
                    options={[
                      { value: 'cover', label: 'Cover' },
                      { value: 'contain', label: 'Contain' },
                      { value: 'auto', label: 'Auto' },
                    ]}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Position</Label>
                  <Input
                    value={bg.position}
                    onChange={(e) => updateProperty(pageKey, 'position', e.target.value)}
                    className="h-7 text-xs"
                    placeholder="center"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Repeat</Label>
                  <BackgroundSelect
                    value={bg.repeat}
                    onChange={(v) => updateProperty(pageKey, 'repeat', v)}
                    options={[
                      { value: 'no-repeat', label: 'No repeat' },
                      { value: 'repeat', label: 'Repeat' },
                    ]}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
