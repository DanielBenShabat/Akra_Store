'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createProduct, updateProduct, deleteProduct, CACHE_TAGS } from '@/lib/data-store';
import { assertAdmin } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
import { prepareUploadImage } from '@/lib/image-processing';
import type { Product, ProductStatus } from '@/types';

type ProductFormValues = Omit<Product, 'id'>;
type ActionResult = { success: boolean; error?: string };
export type ProductOrderGroup =
  | { mode: 'available'; categoryId: string | null }
  | { mode: 'goosebumps' }
  | { mode: 'archive' };

type ProductOrderRow = {
  id: string;
  name: string;
  category_id: string | null;
  is_goosebumps: boolean;
  status: ProductStatus | null;
  stock: number;
};

/** Bust the public catalog cache + the legacy path so the storefront stays in sync. */
function revalidateCatalog(): void {
  revalidateTag(CACHE_TAGS.catalog, 'max');
  revalidatePath('/', 'layout');
  revalidatePath('/available');
  revalidatePath('/archive');
  revalidatePath('/goosebumps');
}

/** Surface the underlying error to the (authenticated) admin UI + server logs. */
function fail(context: string, e: unknown, fallback: string): ActionResult {
  console.error(`[admin] ${context} failed`, e);
  return { success: false, error: e instanceof Error ? e.message : fallback };
}

function getOrderGroup(product: Pick<Product, 'status' | 'isGoosebumps' | 'categoryId'>): ProductOrderGroup | null {
  if (product.status === 'archive') return { mode: 'archive' };
  if (product.status !== 'available') return null;
  if (product.isGoosebumps) return { mode: 'goosebumps' };
  return { mode: 'available', categoryId: product.categoryId ?? null };
}

function getOrderGroupFromRow(row: ProductOrderRow): ProductOrderGroup | null {
  const status = row.status ?? (row.stock < 1 ? 'unavailable' : 'available');
  if (status === 'archive') return { mode: 'archive' };
  if (status !== 'available') return null;
  if (row.is_goosebumps) return { mode: 'goosebumps' };
  return { mode: 'available', categoryId: row.category_id ?? null };
}

function sameGroup(a: ProductOrderGroup | null, b: ProductOrderGroup | null): boolean {
  if (!a || !b) return a === b;
  if (a.mode !== b.mode) return false;
  if (a.mode === 'available' && b.mode === 'available') return a.categoryId === b.categoryId;
  return true;
}

function queryForGroup(group: ProductOrderGroup, columns = 'id, name, category_id, is_goosebumps, status, stock') {
  let query = supabase.from('products').select(columns);
  if (group.mode === 'archive') {
    return query.eq('status', 'archive');
  }
  if (group.mode === 'goosebumps') {
    return query.eq('status', 'available').eq('is_goosebumps', true);
  }
  query = query.eq('status', 'available').eq('is_goosebumps', false);
  return group.categoryId ? query.eq('category_id', group.categoryId) : query.is('category_id', null);
}

async function updateDisplayOrder(id: string, displayOrder: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ display_order: displayOrder })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

async function appendProductToGroup(id: string, group: ProductOrderGroup | null): Promise<void> {
  if (!group) return;
  const { data, error } = await queryForGroup(group, 'display_order')
    .neq('id', id)
    .order('display_order', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const last = data as { display_order?: number } | null;
  const nextOrder = last && typeof last.display_order === 'number' ? last.display_order + 1 : 0;
  await updateDisplayOrder(id, nextOrder);
}

async function normalizeProductOrderForGroup(group: ProductOrderGroup | null): Promise<void> {
  if (!group) return;
  const { data, error } = await queryForGroup(group)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as Array<ProductOrderRow & { display_order?: number }>;
  for (let index = 0; index < rows.length; index += 1) {
    if (rows[index].display_order !== index) {
      await updateDisplayOrder(rows[index].id, index);
    }
  }
}

async function getProductOrderRow(id: string): Promise<ProductOrderRow | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category_id, is_goosebumps, status, stock')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProductOrderRow | null;
}

export async function createProductAction(data: ProductFormValues): Promise<ActionResult> {
  await assertAdmin();
  try {
    const created = await createProduct(data);
    const group = getOrderGroup(created);
    await appendProductToGroup(created.id, group);
    await normalizeProductOrderForGroup(group);
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
    const before = await getProductOrderRow(id);
    const oldGroup = before ? getOrderGroupFromRow(before) : null;
    const updated = await updateProduct(id, data);
    const newGroup = getOrderGroup(updated);

    if (!sameGroup(oldGroup, newGroup)) {
      await appendProductToGroup(id, newGroup);
    }
    await normalizeProductOrderForGroup(oldGroup);
    await normalizeProductOrderForGroup(newGroup);
    revalidateCatalog();
    return { success: true };
  } catch (e) {
    return fail('updateProduct', e, 'Failed to update product');
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await assertAdmin();
  try {
    const before = await getProductOrderRow(id);
    const oldGroup = before ? getOrderGroupFromRow(before) : null;
    await deleteProduct(id);
    await normalizeProductOrderForGroup(oldGroup);
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

  const { buffer, contentType, ext } = await prepareUploadImage(file);
  const filename = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, buffer, { contentType });

  if (error) {
    console.error('[admin] product image upload failed', error);
    return { error: `Image upload failed: ${error.message}` };
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(filename);
  return { url: data.publicUrl };
}

export async function reorderProductsAction(
  payload: { orderedIds: string[]; group: ProductOrderGroup },
): Promise<ActionResult> {
  await assertAdmin();
  try {
    const { orderedIds, group } = payload;
    if (orderedIds.length === 0) return { success: true };

    const { data, error } = await supabase
      .from('products')
      .select('id, name, category_id, is_goosebumps, status, stock')
      .in('id', orderedIds);
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as ProductOrderRow[];
    if (rows.length !== orderedIds.length) {
      return { success: false, error: 'Some products were not found' };
    }
    const invalid = rows.find((row) => !sameGroup(getOrderGroupFromRow(row), group));
    if (invalid) {
      return { success: false, error: 'Can only reorder products within the same section' };
    }

    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index,
    }));
    const results = await Promise.all(
      updates.map((u) =>
        supabase.from('products').update({ display_order: u.display_order }).eq('id', u.id),
      ),
    );
    const failure = results.find((r) => r.error);
    if (failure?.error) {
      throw new Error(failure.error.message);
    }
    await normalizeProductOrderForGroup(group);
    revalidateCatalog();
    return { success: true };
  } catch (e) {
    return fail('reorderProducts', e, 'Failed to reorder products');
  }
}
