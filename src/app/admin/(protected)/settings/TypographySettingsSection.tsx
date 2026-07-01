'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { Label } from '@/components/admin-ui/label';
import type { TypographySettings } from '@/lib/site-settings';
import { updateTypographySettingsAction } from './actions';

interface Props {
  typography: TypographySettings;
}

const STYLE_LABELS: Record<string, string> = {
  pageTitle: 'Page Title',
  sectionTitle: 'Section Title',
  productTitle: 'Product Title',
  productPrice: 'Product Price',
  bodyText: 'Body Text',
  navText: 'Nav Text',
};

const PREVIEW_TEXT: Record<string, string> = {
  pageTitle: 'Page Title Preview',
  sectionTitle: 'Section Title Preview',
  productTitle: 'Product Name Preview',
  productPrice: '₪320',
  bodyText: 'This is how regular page text will look.',
  navText: 'Archive / Available / Contact',
};

const STYLE_KEYS = ['pageTitle', 'sectionTitle', 'productTitle', 'productPrice', 'bodyText', 'navText'] as const;

export default function TypographySettingsSection({ typography }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [defaults, setDefaults] = useState(typography.defaults);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const nextDefaults: Record<string, { mobilePx: number; desktopPx: number }> = {};
    for (const key of STYLE_KEYS) {
      nextDefaults[key] = {
        mobilePx: Number(formData.get(`${key}_mobile`)),
        desktopPx: Number(formData.get(`${key}_desktop`)),
      };
    }

    const payload = new FormData();
    payload.append('value', JSON.stringify({ defaults: nextDefaults, pages: typography.pages }));

    startTransition(async () => {
      const result = await updateTypographySettingsAction(payload);
      if (result.success) {
        toast.success('Typography saved');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to save typography');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-border p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Typography</h2>
        <p className="text-sm text-muted-foreground">
          Set font sizes in pixels for different text styles.
        </p>
      </div>

      <div className="space-y-3">
        {STYLE_KEYS.map((key) => {
          const label = STYLE_LABELS[key];
          const scale = defaults[key];
          return (
            <div key={key} className="rounded-md border border-border p-3">
              <Label className="text-sm font-medium mb-2 block">{label}</Label>
              <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs text-muted-foreground">Mobile (px)</Label>
                  <Input
                    name={`${key}_mobile`}
                    type="number"
                    min="8"
                    max="96"
                    value={scale?.mobilePx ?? 14}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setDefaults((current) => ({
                        ...current,
                        [key]: { ...current[key], mobilePx: value },
                      }));
                    }}
                    disabled={isPending}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs text-muted-foreground">Desktop (px)</Label>
                  <Input
                    name={`${key}_desktop`}
                    type="number"
                    min="8"
                    max="96"
                    value={scale?.desktopPx ?? 16}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setDefaults((current) => ({
                        ...current,
                        [key]: { ...current[key], desktopPx: value },
                      }));
                    }}
                    disabled={isPending}
                    className="h-8"
                  />
                </div>
              </div>
              <div className="mt-3 rounded-md border border-dashed border-border bg-muted/30 p-3">
                <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Preview uses mobile size now: {scale?.mobilePx ?? 14}px / desktop: {scale?.desktopPx ?? 16}px
                </p>
                <p
                  className="leading-snug"
                  style={{ fontSize: `${scale?.mobilePx ?? 14}px` }}
                >
                  {PREVIEW_TEXT[key]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="bg-foreground text-background hover:bg-foreground/90"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
          </>
        ) : (
          'Save typography'
        )}
      </Button>
    </form>
  );
}
