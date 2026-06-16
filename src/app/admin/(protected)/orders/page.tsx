import { getOrders } from '@/lib/data-store';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { Badge } from '@/components/admin-ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/admin-ui/table';

export const dynamic = 'force-dynamic';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

const shippingMethodLabel: Record<string, string> = {
  home: 'Home Delivery',
  pickup: 'Pick-up Point',
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Customer orders and payment status.</p>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Shipping</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                <TableCell>
                  {order.first_name} {order.last_name}
                </TableCell>
                <TableCell>
                  {shippingMethodLabel[order.shipping_method] ?? order.shipping_method}
                </TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status] ?? 'outline'}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(order.total, siteConfig.currency.symbol)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
