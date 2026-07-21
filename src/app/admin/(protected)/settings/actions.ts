'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { assertAdmin } from '@/lib/admin-auth';
import {
  SETTINGS_CACHE_TAG,
  updateImageSetting,
  updateShippingSettings,
  updateJsonSetting,
  defaultSiteSettings,
  type ShippingSettings,
} from '@/lib/site-settings';
import { supabase } from '@/lib/supabase';
import { processSettingImage } from '@/lib/image-processing';

type ActionResult = { success: boolean; error?: string; url?: string };

function fail(context: string, e: unknown, fallback: string): ActionResult {
  console.error(`[admin] ${context} failed`, e);
  return { success: false, error: e instanceof Error ? e.message : fallback };
}

function revalidateSettings(): void {
  revalidateTag(SETTINGS_CACHE_TAG, 'max');
  revalidatePath('/', 'layout');
  revalidatePath('/checkout');
}

function numberFromForm(formData: FormData, key: string): number {
  const value = Number(formData.get(key));
  if (!Number.isFinite(value) || value < 0) throw new Error(`${key} must be a positive number`);
  return value;
}

export async function updateShippingSettingsAction(formData: FormData): Promise<ActionResult> {
  await assertAdmin();
  try {
    const settings: ShippingSettings = {
      standardFee: numberFromForm(formData, 'standardFee'),
      pickupFee: numberFromForm(formData, 'pickupFee'),
      freeStandardEnabled: formData.get('freeStandardEnabled') === 'on',
      freeStandardThreshold: numberFromForm(formData, 'freeStandardThreshold'),
    };
    await updateShippingSettings(settings);
    revalidateSettings();
    return { success: true };
  } catch (e) {
    return fail('updateShippingSettings', e, 'Failed to update shipping settings');
  }
}

export async function uploadSettingImageAction(formData: FormData): Promise<ActionResult> {
  await assertAdmin();
  const file = formData.get('file') as File | null;
  const key = formData.get('key') as string | null;
  if (!key) return { success: false, error: 'No key provided' };
  if (!file || file.size === 0) return { success: false, error: 'No file provided' };

  const isOldSetting = key === 'logo' || key === 'top_logo' || key === 'hero_background';
  const isIcon = key.startsWith('icons_');
  const isBg = key.startsWith('bg_');
  if (!isOldSetting && !isIcon && !isBg) {
    return { success: false, error: 'Invalid setting' };
  }

  try {
    // hero_background is a photo like the bg_* keys — treating it as a
    // logo would trim edges and bloat it into a giant PNG.
    const isBackground = isBg || key === 'hero_background';
    const subfolder = isIcon ? 'icons' : isBackground ? 'backgrounds' : 'logos';
    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const { buffer, contentType, ext } = await processSettingImage(
      inputBuffer,
      isBackground ? 'background' : 'graphic',
    );
    const filename = `settings/${subfolder}/${key}-${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, { contentType, upsert: false });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from('product-images').getPublicUrl(filename);

    // For old settings, save directly. For new ones, just return the URL.
    if (isOldSetting) {
      await updateImageSetting(key as 'logo' | 'top_logo' | 'hero_background', data.publicUrl);
      revalidateSettings();
    }
    return { success: true, url: data.publicUrl };
  } catch (e) {
    return fail('uploadSettingImage', e, 'Failed to upload image');
  }
}

export async function clearSettingImageAction(
  key: 'logo' | 'top_logo' | 'hero_background',
): Promise<ActionResult> {
  await assertAdmin();
  try {
    await updateImageSetting(key, null);
    revalidateSettings();
    return { success: true };
  } catch (e) {
    return fail('clearSettingImage', e, 'Failed to clear image setting');
  }
}

// ── New settings actions ─────────────────────────────────────────────────────

export async function updateIconsSettingsAction(formData: FormData): Promise<ActionResult> {
  await assertAdmin();
  try {
    const slot = formData.get('slot') as string | null;
    const url = formData.get('url') as string | null;
    const widthStr = formData.get('width') as string | null;
    const heightStr = formData.get('height') as string | null;

    // When called from the upload flow, we read the full icons payload from 'value'
    // When called from the reset flow, we update a single slot
    const valueRaw = formData.get('value');
    if (valueRaw) {
      const value = JSON.parse(valueRaw as string);
      await updateJsonSetting('icons', value);
    } else if (slot) {
      // Update single slot — get current, merge, save
      const { getSiteSettings } = await import('@/lib/site-settings');
      const current = await getSiteSettings();
      const icons = { ...current.icons };
      icons[slot as keyof typeof icons] = {
        url: url || null,
        width: widthStr ? Number(widthStr) : null,
        height: heightStr ? Number(heightStr) : null,
      };
      await updateJsonSetting('icons', icons);
    }
    revalidateSettings();
    return { success: true };
  } catch (e) {
    return fail('updateIconsSettings', e, 'Failed to update icon settings');
  }
}

export async function updateNavigationSettingsAction(formData: FormData): Promise<ActionResult> {
  await assertAdmin();
  try {
    const valueRaw = formData.get('value') as string;
    const value = JSON.parse(valueRaw);
    await updateJsonSetting('navigation', value);
    revalidateSettings();
    return { success: true };
  } catch (e) {
    return fail('updateNavigationSettings', e, 'Failed to update navigation settings');
  }
}

export async function updateContentSettingsAction(formData: FormData): Promise<ActionResult> {
  await assertAdmin();
  try {
    const valueRaw = formData.get('value') as string;
    const value = JSON.parse(valueRaw);
    await updateJsonSetting('content', value);
    revalidateSettings();
    revalidatePath('/about');
    revalidatePath('/contact');
    return { success: true };
  } catch (e) {
    return fail('updateContentSettings', e, 'Failed to update content settings');
  }
}

export async function updateTypographySettingsAction(formData: FormData): Promise<ActionResult> {
  await assertAdmin();
  try {
    const valueRaw = formData.get('value') as string;
    const value = JSON.parse(valueRaw);
    await updateJsonSetting('typography', value);
    revalidateSettings();
    revalidatePath('/available');
    revalidatePath('/archive');
    revalidatePath('/goosebumps');
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/faq');
    revalidatePath('/checkout');
    return { success: true };
  } catch (e) {
    return fail('updateTypographySettings', e, 'Failed to update typography settings');
  }
}

export async function resetTypographySettingsAction(): Promise<ActionResult> {
  await assertAdmin();
  try {
    await updateJsonSetting('typography', defaultSiteSettings.typography);
    revalidateSettings();
    revalidatePath('/available');
    revalidatePath('/archive');
    revalidatePath('/goosebumps');
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/faq');
    revalidatePath('/checkout');
    return { success: true };
  } catch (e) {
    return fail('resetTypographySettings', e, 'Failed to reset typography settings');
  }
}

export async function updatePageBackgroundsSettingsAction(formData: FormData): Promise<ActionResult> {
  await assertAdmin();
  try {
    const valueRaw = formData.get('value') as string;
    const value = JSON.parse(valueRaw);
    await updateJsonSetting('page_backgrounds', value);
    revalidateSettings();
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/available');
    revalidatePath('/archive');
    revalidatePath('/goosebumps');
    revalidatePath('/faq');
    return { success: true };
  } catch (e) {
    return fail('updatePageBackgroundsSettings', e, 'Failed to update page background settings');
  }
}
