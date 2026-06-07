import { getCategories } from '@/lib/data-store';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage product categories. Deleting a category will unassign its products.
        </p>
      </div>
      <CategoriesClient categories={categories} />
    </div>
  );
}
