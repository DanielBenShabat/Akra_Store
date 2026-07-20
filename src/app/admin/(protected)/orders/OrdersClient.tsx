'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import type { Order } from '@/types';
import type { OrderRow } from '@/lib/data-store';
import { Badge } from '@/components/admin-ui/badge';
import { Button } from '@/components/admin-ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/admin-ui/table';
import { updateOrderStatusAction, markOrderPaidAction } from './actions';

const ORDER_STATUSES: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

const shippingMethodLabel: Record<string, string> = {
  standard: 'Standard Delivery',
  pickup: 'Self Pick-up',
  // Legacy values from earlier orders.
  express: 'Express Delivery',
  home: 'Home Delivery',
};

function orderAddress(order: OrderRow): string {
  return [order.street, order.house_number, order.city, order.postal_code].filter(Boolean).join(', ');
}

export default function OrdersClient({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function updateStatus(order: OrderRow, status: Order['status']) {
    if (status === order.status) return;

    setUpdatingId(order.id);
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      setUpdatingId(null);

      if (result.success) {
        toast.success('Order status updated');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update order status');
      }
    });
  }

  function markPaid(order: OrderRow) {
    setUpdatingId(order.id);
    startTransition(async () => {
      const result = await markOrderPaidAction(order.id);
      setUpdatingId(null);

      if (result.success) {
        toast.success('Order confirmed — stock updated and receipt sent');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to confirm order');
      }
    });
  }

  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Address</TableHead>
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
                <div>
                  {order.first_name} {order.last_name}
                </div>
                <div className="text-xs text-muted-foreground">{order.phone}</div>
                <div className="text-xs text-muted-foreground">{order.email}</div>
              </TableCell>
              <TableCell>
                {order.items.length === 0 ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <ul className="space-y-0.5">
                    {order.items.map((item, i) => (
                      <li key={i} className="text-sm">
                        {item.name}
                        <span className="text-muted-foreground"> · {item.size}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </TableCell>
              <TableCell className="min-w-40 text-sm">{orderAddress(order) || '—'}</TableCell>
              <TableCell className="min-w-36 text-sm">
                <div>{shippingMethodLabel[order.shipping_method] ?? order.shipping_method}</div>
                <div className="text-xs text-muted-foreground">
                  {formatPrice(order.shipping, siteConfig.currency.symbol)}
                </div>
              </TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[order.status] ?? 'outline'}>{order.status}</Badge>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order, e.target.value as Order['status'])}
                      disabled={isPending && updatingId === order.id}
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      aria-label={`Update status for order ${order.id.slice(0, 8)}`}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => markPaid(order)}
                      disabled={isPending && updatingId === order.id}
                      className="h-7 bg-foreground text-background hover:bg-foreground/90"
                    >
                      Mark as paid
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(order.total, siteConfig.currency.symbol)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
