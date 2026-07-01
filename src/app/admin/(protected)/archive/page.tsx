import { getProducts, getCategories } from '@/lib/data-store';
import InventoryClient from '../inventory/InventoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminArchivePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const archiveProducts = products.filter((product) => product.status === 'archive');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage archive items. These appear on the public Archive page as image/name cards only.
        </p>
      </div>
      <InventoryClient products={archiveProducts} categories={categories} mode="archive" />
    </div>
  );
}
