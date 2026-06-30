import { getProducts, getCategories } from '@/lib/data-store';
import InventoryClient from '../inventory/InventoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminGoosebumpsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const goosebumpsProducts = products.filter((product) => product.isGoosebumps);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Goosebumps</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add Goosebumps items, hide them from the public page, or move them back to inventory.
        </p>
      </div>
      <InventoryClient products={goosebumpsProducts} categories={categories} mode="goosebumps" />
    </div>
  );
}
