'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { ArchiveItem } from '@/types';
import { Button } from '@/components/admin-ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/admin-ui/table';
import {
  createArchiveItemAction,
  updateArchiveItemAction,
  deleteArchiveItemAction,
} from './actions';
import ArchiveItemFormDialog from './ArchiveItemFormDialog';

interface Props {
  items: ArchiveItem[];
}

type ArchiveFormValues = Omit<ArchiveItem, 'id'>;

export default function ArchiveClient({ items }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ArchiveItem | null>(null);

  function openAdd() {
    setEditItem(null);
    setFormOpen(true);
  }

  function openEdit(item: ArchiveItem) {
    setEditItem(item);
    setFormOpen(true);
  }

  function handleFormSubmit(data: ArchiveFormValues) {
    startTransition(async () => {
      const result = editItem
        ? await updateArchiveItemAction(editItem.id, data)
        : await createArchiveItemAction(data);

      if (result.success) {
        setFormOpen(false);
        toast.success(editItem ? 'Archive item updated' : 'Archive item added');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });
  }

  function handleDelete(item: ArchiveItem) {
    if (!confirm('Delete this archive item?')) return;
    startTransition(async () => {
      const result = await deleteArchiveItemAction(item.id);
      if (result.success) {
        toast.success('Archive item deleted');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Archive Item
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>X (%)</TableHead>
              <TableHead>Y (%)</TableHead>
              <TableHead>Size (%)</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No archive items yet. Add your first one.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                </TableCell>
                <TableCell>{item.xPosition}</TableCell>
                <TableCell>{item.yPosition}</TableCell>
                <TableCell>{item.size}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(item)}
                      disabled={isPending}
                      aria-label="Edit archive item"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item)}
                      disabled={isPending}
                      aria-label="Delete archive item"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ArchiveItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editItem}
        onSubmit={handleFormSubmit}
        pending={isPending}
      />
    </>
  );
}
