import { getProducts, getCategories } from '@/lib/data-store';
import InventoryClient from './InventoryClient';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your products and stock levels.
        </p>
      </div>
      <InventoryClient products={products} categories={categories} />
    </div>
  );
}
