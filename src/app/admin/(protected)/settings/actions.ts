'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import sharp from 'sharp';
import { assertAdmin } from '@/lib/admin-auth';
import {
  SETTINGS_CACHE_TAG,
  updateImageSetting,
  updateShippingSettings,
  type ShippingSettings,
} from '@/lib/site-settings';
import { supabase } from '@/lib/supabase';

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
      expressFee: numberFromForm(formData, 'expressFee'),
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
  const key = formData.get('key');
  if (key !== 'logo' && key !== 'top_logo' && key !== 'hero_background') {
    return { success: false, error: 'Invalid setting' };
  }
  if (!file || file.size === 0) return { success: false, error: 'No file provided' };

  try {
    const filename = `settings/${key}-${crypto.randomUUID()}.png`;
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const buffer = await sharp(inputBuffer)
      .rotate()
      .trim({ threshold: 10 })
      .png()
      .toBuffer();

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, { contentType: 'image/png', upsert: false });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from('product-images').getPublicUrl(filename);
    await updateImageSetting(key, data.publicUrl);
    revalidateSettings();
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
