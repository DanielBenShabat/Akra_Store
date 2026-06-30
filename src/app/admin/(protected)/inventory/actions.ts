'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createProduct, updateProduct, deleteProduct, CACHE_TAGS } from '@/lib/data-store';
import { assertAdmin } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

type ProductFormValues = Omit<Product, 'id'>;
type ActionResult = { success: boolean; error?: string };

/** Bust the public catalog cache + the legacy path so the storefront stays in sync. */
function revalidateCatalog(): void {
  revalidateTag(CACHE_TAGS.catalog, 'max');
  revalidatePath('/', 'layout');
}

/** Surface the underlying error to the (authenticated) admin UI + server logs. */
function fail(context: string, e: unknown, fallback: string): ActionResult {
  console.error(`[admin] ${context} failed`, e);
  return { success: false, error: e instanceof Error ? e.message : fallback };
}

export async function createProductAction(data: ProductFormValues): Promise<ActionResult> {
  await assertAdmin();
  try {
    await createProduct(data);
    revalidateCatalog();
    return { success: true };
  } catch (e) {
    return fail('createProduct', e, 'Failed to create product');
  }
}

export async function updateProductAction(
  id: string,
  data: Partial<ProductFormValues>,
): Promise<ActionResult> {
  await assertAdmin();
  try {
    await updateProduct(id, data);
    revalidateCatalog();
    return { success: true };
  } catch (e) {
    return fail('updateProduct', e, 'Failed to update product');
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await assertAdmin();
  try {
    await deleteProduct(id);
    revalidateCatalog();
    return { success: true };
  } catch (e) {
    return fail('deleteProduct', e, 'Failed to delete product');
  }
}

export async function uploadProductImageAction(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await assertAdmin();
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return { error: 'No file provided' };

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, buffer, { contentType: file.type });

  if (error) {
    console.error('[admin] product image upload failed', error);
    return { error: `Image upload failed: ${error.message}` };
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(filename);
  return { url: data.publicUrl };
}
