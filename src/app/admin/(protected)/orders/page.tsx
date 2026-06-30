import { getOrders } from '@/lib/data-store';
import OrdersClient from './OrdersClient';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Customer orders and payment status.</p>
      </div>

      <OrdersClient orders={orders} />
    </div>
  );
}
