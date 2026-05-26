'use server';

import { revalidatePath } from 'next/cache';
import { createProduct, updateProduct, deleteProduct } from '@/lib/data-store';
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
