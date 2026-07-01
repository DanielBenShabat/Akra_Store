'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createCategory, updateCategory, deleteCategory, CACHE_TAGS } from '@/lib/data-store';
import { assertAdmin } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';

type ActionResult = { success: boolean; error?: string };

/** Bust the public catalog cache + admin/legacy paths so everything stays in sync. */
function revalidateCatalog(): void {
  revalidateTag(CACHE_TAGS.catalog, 'max');
  revalidatePath('/admin/categories');
  revalidatePath('/', 'layout');
}

export async function reorderCategoriesAction(orderedIds: string[]): Promise<ActionResult> {
  await assertAdmin();
  try {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index,
    }));
    const results = await Promise.allSettled(
      updates.map((u) =>
        supabase
          .from('categories')
          .update({ display_order: u.display_order })
          .eq('id', u.id),
      ),
    );
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('[admin] reorderCategories failures', failures);
      return { success: false, error: `${failures.length} category(ies) failed to reorder` };
    }
    revalidateCatalog();
    return { success: true };
  } catch (e) {
    console.error('[admin] reorderCategories failed', e);
    return { success: false, error: 'Failed to reorder categories' };
  }
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
