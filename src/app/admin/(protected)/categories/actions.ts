'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createCategory, updateCategory, deleteCategory, CACHE_TAGS } from '@/lib/data-store';
import { assertAdmin } from '@/lib/admin-auth';

type ActionResult = { success: boolean; error?: string };

/** Bust the public catalog cache + admin/legacy paths so everything stays in sync. */
function revalidateCatalog(): void {
  revalidateTag(CACHE_TAGS.catalog, 'max');
  revalidatePath('/admin/categories');
  revalidatePath('/', 'layout');
}

export async function createCategoryAction(name: string): Promise<ActionResult> {
  await assertAdmin();
  try {
    await createCategory(name);
    revalidateCatalog();
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to create category' };
  }
}

export async function updateCategoryAction(id: string, name: string): Promise<ActionResult> {
  await assertAdmin();
  try {
    await updateCategory(id, name);
    revalidateCatalog();
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await assertAdmin();
  try {
    await deleteCategory(id);
    revalidateCatalog();
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete category' };
  }
}
