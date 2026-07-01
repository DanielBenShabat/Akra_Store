'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import {
  createArchiveItem,
  updateArchiveItem,
  deleteArchiveItem,
  CACHE_TAGS,
} from '@/lib/data-store';
import { assertAdmin } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
import type { ArchiveItem } from '@/types';

type ArchiveItemValues = Omit<ArchiveItem, 'id'>;
type ActionResult = { success: boolean; error?: string };

/** Surface the underlying error to the (authenticated) admin UI + server logs. */
function fail(context: string, e: unknown, fallback: string): ActionResult {
  console.error(`[admin] ${context} failed`, e);
  return { success: false, error: e instanceof Error ? e.message : fallback };
}

/** Bust the public archive cache + admin/legacy paths so everything stays in sync. */
function revalidateArchive(): void {
  revalidateTag(CACHE_TAGS.archive, 'max');
  revalidatePath('/admin/archive');
  revalidatePath('/archive');
}

export async function uploadArchiveImageAction(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await assertAdmin();
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return { error: 'No file provided' };

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `archive/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error('[admin] archive image upload failed', error);
    return { error: `Image upload failed: ${error.message}` };
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(filename);
  return { url: data.publicUrl };
}

export async function createArchiveItemAction(data: ArchiveItemValues): Promise<ActionResult> {
  await assertAdmin();
  try {
    await createArchiveItem(data);
    revalidateArchive();
    return { success: true };
  } catch (e) {
    return fail('createArchiveItem', e, 'Failed to create archive item');
  }
}

export async function updateArchiveItemAction(
  id: string,
  data: Partial<ArchiveItemValues>,
): Promise<ActionResult> {
  await assertAdmin();
  try {
    await updateArchiveItem(id, data);
    revalidateArchive();
    return { success: true };
  } catch (e) {
    return fail('updateArchiveItem', e, 'Failed to update archive item');
  }
}

export async function deleteArchiveItemAction(id: string): Promise<ActionResult> {
  await assertAdmin();
  try {
    await deleteArchiveItem(id);
    revalidateArchive();
    return { success: true };
  } catch (e) {
    return fail('deleteArchiveItem', e, 'Failed to delete archive item');
  }
}
