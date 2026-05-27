'use server';

import { revalidatePath } from 'next/cache';
import { createProduct, updateProduct, deleteProduct } from '@/lib/data-store';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

type ProductFormValues = Omit<Product, 'id'>;
type ActionResult = { success: boolean; error?: string };

export async function createProductAction(data: ProductFormValues): Promise<ActionResult> {
  try {
    await createProduct(data);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProductAction(
  id: string,
  data: Partial<ProductFormValues>,
): Promise<ActionResult> {
  try {
    await updateProduct(id, data);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await deleteProduct(id);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function uploadProductImageAction(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return { error: 'No file provided' };

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, buffer, { contentType: file.type });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from('product-images').getPublicUrl(filename);
  return { url: data.publicUrl };
}
