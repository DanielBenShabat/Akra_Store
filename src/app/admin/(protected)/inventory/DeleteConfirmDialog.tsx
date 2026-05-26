'use client';

import type { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/admin-ui/dialog';
import { Button } from '@/components/admin-ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onConfirm: () => void;
  pending: boolean;
}

export default function DeleteConfirmDialog({ open, onOpenChange, product, onConfirm, pending }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">{product?.name}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
