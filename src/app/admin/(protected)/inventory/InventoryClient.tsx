'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { Product, Category } from '@/types';
import { Button } from '@/components/admin-ui/button';
import { Badge } from '@/components/admin-ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/admin-ui/table';
import { createProductAction, updateProductAction, deleteProductAction } from './actions';
import ProductFormDialog from './ProductFormDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

function StockBadge({ stock }: { stock: number }) {
  if (stock < 3)
    return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">{stock}</Badge>;
  if (stock < 10)
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">{stock}</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">{stock}</Badge>;
}

interface Props {
  products: Product[];
  categories: Category[];
}

type ProductFormValues = Omit<Product, 'id'>;

export default function InventoryClient({ products, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  function openAdd() {
    setEditProduct(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditProduct(product);
    setFormOpen(true);
  }

  function openDelete(product: Product) {
    setDeleteProduct(product);
    setDeleteOpen(true);
  }

  function handleFormSubmit(data: ProductFormValues) {
    startTransition(async () => {
      const result = editProduct
        ? await updateProductAction(editProduct.id, data)
        : await createProductAction(data);

      if (result.success) {
        setFormOpen(false);
        toast.success(editProduct ? 'Product updated' : 'Product added');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });
  }

  function handleDeleteConfirm() {
    if (!deleteProduct) return;
    startTransition(async () => {
      const result = await deleteProductAction(deleteProduct.id);
      if (result.success) {
        setDeleteOpen(false);
        setDeleteProduct(null);
        toast.success('Product deleted');
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
          Add Product
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No products yet. Add your first product.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => {
              const cat = product.categoryId ? categoryMap.get(product.categoryId) : undefined;
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {cat ? (
                      <Badge variant="outline" className="text-muted-foreground capitalize">
                        {cat.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>₪{product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <StockBadge stock={product.stock} />
                  </TableCell>
                  <TableCell>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(product)}
                        disabled={isPending}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDelete(product)}
                        disabled={isPending}
                        aria-label={`Delete ${product.name}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editProduct}
        onSubmit={handleFormSubmit}
        pending={isPending}
        categories={categories}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={deleteProduct}
        onConfirm={handleDeleteConfirm}
        pending={isPending}
      />
    </>
  );
}
