'use server';

import { revalidatePath } from 'next/cache';
import { createCategory, updateCategory, deleteCategory } from '@/lib/data-store';

type ActionResult = { success: boolean; error?: string };

export async function createCategoryAction(name: string): Promise<ActionResult> {
  try {
    await createCategory(name);
    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to create category' };
  }
}

export async function updateCategoryAction(id: string, name: string): Promise<ActionResult> {
  try {
    await updateCategory(id, name);
    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await deleteCategory(id);
    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete category' };
  }
}
