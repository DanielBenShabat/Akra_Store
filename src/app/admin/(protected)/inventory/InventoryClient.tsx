'use client';

import { Fragment, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, LayoutGrid, Table2, GripVertical } from 'lucide-react';
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
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  reorderProductsAction,
  type ProductOrderGroup,
} from './actions';
import ProductFormDialog, { type ProductFormSubmitData } from './ProductFormDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

type InventoryMode = 'inventory' | 'goosebumps' | 'archive';
type GroupKey = string | '__goosebumps__' | '__archive__' | '__uncategorized__' | '__unavailable__';

type ProductGroup = {
  key: GroupKey;
  name: string;
  products: Product[];
  orderGroup: ProductOrderGroup | null;
};

function StatusBadge({ status }: { status: Product['status'] }) {
  if (status === 'archive') {
    return (
      <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-100">
        Archive
      </Badge>
    );
  }
  if (status === 'unavailable') {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        Not Available
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Available</Badge>
  );
}

interface Props {
  products: Product[];
  categories: Category[];
  mode?: InventoryMode;
}

function getSourceKey(products: Product[]): string {
  return products.map((p) => `${p.id}:${p.status}:${p.categoryId ?? ''}:${p.isGoosebumps}`).join('|');
}

function replaceGroupProducts(
  products: Product[],
  groupProductIds: Set<string>,
  reorderedGroupProducts: Product[],
): Product[] {
  return [...products.filter((product) => !groupProductIds.has(product.id)), ...reorderedGroupProducts];
}

function SortableProductCard({
  product,
  pending,
  sortable,
  onEdit,
  onDelete,
}: {
  product: Product;
  pending: boolean;
  sortable: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
    disabled: pending || !sortable,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border border-border bg-card overflow-hidden ${isDragging ? 'opacity-60 shadow-lg' : ''}`}
    >
      <div className="aspect-square bg-muted relative">
        {product.images[0] ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            No image
          </div>
        )}
        <div className="absolute top-1 right-1">
          <StatusBadge status={product.status} />
        </div>
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={pending || !sortable}
          className="absolute left-1 top-1 rounded bg-background/90 p-1 text-muted-foreground shadow-sm hover:text-foreground disabled:opacity-30"
          aria-label={`Drag ${product.name} to reorder`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
      <div className="p-2 space-y-1">
        <p className="text-sm font-medium truncate">{product.name}</p>
        <p className="text-sm text-muted-foreground">₪{product.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center justify-end gap-1 px-2 pb-2">
        <button
          type="button"
          onClick={() => onEdit(product)}
          disabled={pending}
          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
          aria-label={`Edit ${product.name}`}
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(product)}
          disabled={pending}
          className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30"
          aria-label={`Delete ${product.name}`}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default function InventoryClient({ products, categories, mode = 'inventory' }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [visualMode, setVisualMode] = useState(false);
  const sourceKey = getSourceKey(products);
  const [orderedState, setOrderedState] = useState(() => ({ sourceKey, products }));
  const displayProducts = orderedState.sourceKey === sourceKey ? orderedState.products : products;
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const groups: ProductGroup[] = [];
  if (mode === 'goosebumps') {
    const available = displayProducts.filter((product) => product.status === 'available');
    const hidden = displayProducts.filter((product) => product.status !== 'available');
    if (available.length > 0) {
      groups.push({
        key: '__goosebumps__',
        name: 'Goosebumps',
        products: available,
        orderGroup: { mode: 'goosebumps' },
      });
    }
    if (hidden.length > 0) {
      groups.push({
        key: '__unavailable__',
        name: 'Hidden / unavailable',
        products: hidden,
        orderGroup: null,
      });
    }
  } else if (mode === 'archive') {
    groups.push({
      key: '__archive__',
      name: 'Archive',
      products: displayProducts,
      orderGroup: { mode: 'archive' },
    });
  } else {
    for (const category of categories) {
      const categoryProducts = displayProducts.filter(
        (product) => product.status === 'available' && product.categoryId === category.id,
      );
      if (categoryProducts.length > 0) {
        groups.push({
          key: category.id,
          name: category.name,
          products: categoryProducts,
          orderGroup: { mode: 'available', categoryId: category.id },
        });
      }
    }
    const uncategorized = displayProducts.filter(
      (product) => product.status === 'available' && !product.categoryId,
    );
    if (uncategorized.length > 0) {
      groups.push({
        key: '__uncategorized__',
        name: 'Uncategorized',
        products: uncategorized,
        orderGroup: { mode: 'available', categoryId: null },
      });
    }
    const archiveProducts = displayProducts.filter((product) => product.status === 'archive');
    if (archiveProducts.length > 0) {
      groups.push({
        key: '__archive__',
        name: 'Archive',
        products: archiveProducts,
        orderGroup: { mode: 'archive' },
      });
    }
    const unavailableProducts = displayProducts.filter((product) => product.status === 'unavailable');
    if (unavailableProducts.length > 0) {
      groups.push({
        key: '__unavailable__',
        name: 'Unavailable',
        products: unavailableProducts,
        orderGroup: null,
      });
    }
  }

  function persistGroupOrder(group: ProductGroup, reorderedGroupProducts: Product[], previousProducts: Product[]) {
    const orderGroup = group.orderGroup;
    if (!orderGroup) return;
    startTransition(async () => {
      const result = await reorderProductsAction({
        group: orderGroup,
        orderedIds: reorderedGroupProducts.map((product) => product.id),
      });
      if (result.success) {
        router.refresh();
      } else {
        setOrderedState({ sourceKey, products: previousProducts });
        toast.error(result.error ?? 'Failed to reorder');
      }
    });
  }

  function moveProduct(group: ProductGroup, productId: string, direction: -1 | 1) {
    if (!group.orderGroup) return;
    const idx = group.products.findIndex((p) => p.id === productId);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= group.products.length) return;
    const reordered = [...group.products];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    const previousProducts = displayProducts;
    const nextProducts = replaceGroupProducts(
      displayProducts,
      new Set(group.products.map((product) => product.id)),
      reordered,
    );
    setOrderedState({ sourceKey, products: nextProducts });
    persistGroupOrder(group, reordered, previousProducts);
  }

  function handleDragEnd(group: ProductGroup, event: DragEndEvent) {
    if (!group.orderGroup) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = group.products.findIndex((product) => product.id === active.id);
    const newIndex = group.products.findIndex((product) => product.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(group.products, oldIndex, newIndex);
    const previousProducts = displayProducts;
    const nextProducts = replaceGroupProducts(
      displayProducts,
      new Set(group.products.map((product) => product.id)),
      reordered,
    );
    setOrderedState({ sourceKey, products: nextProducts });
    persistGroupOrder(group, reordered, previousProducts);
  }

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

  function handleFormSubmit(data: ProductFormSubmitData) {
    startTransition(async () => {
      const result = editProduct
        ? await updateProductAction(editProduct.id, data.product)
        : await createProductAction(data.product);

      if (!result.success) {
        toast.error(result.error ?? 'Something went wrong');
        return;
      }

      setFormOpen(false);
      toast.success(editProduct ? 'Product updated' : 'Product added');
      router.refresh();
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
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => setVisualMode(!visualMode)}
          className="gap-2"
        >
          {visualMode ? (
            <><Table2 className="h-4 w-4" /> Table view</>
          ) : (
            <><LayoutGrid className="h-4 w-4" /> Visual order view</>
          )}
        </Button>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          {mode === 'goosebumps' ? 'Add Goosebumps Item' : mode === 'archive' ? 'Add Archive Item' : 'Add Product'}
        </Button>
      </div>

      {visualMode ? (
        /* ── Storefront-like visual view ── */
        <div className="space-y-6">
          {groups.map((group) => {
            if (group.products.length === 0) return null;
            return (
              <div key={group.key}>
                <h3 className="text-lg font-semibold mb-3 capitalize">{group.name}</h3>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(group, event)}
                >
                  <SortableContext items={group.products.map((product) => product.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {group.products.map((product) => (
                        <SortableProductCard
                          key={product.id}
                          product={product}
                          pending={isPending}
                          sortable={Boolean(group.orderGroup)}
                          onEdit={openEdit}
                          onDelete={openDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Table view ── */
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[84px]">Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Image</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    No products yet. Add your first product.
                  </TableCell>
                </TableRow>
              )}
              {groups.map((group) => (
                <Fragment key={group.key}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={8} className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.name}
                    </TableCell>
                  </TableRow>
                  {group.products.map((product, index) => {
                    const cat = product.categoryId ? categoryMap.get(product.categoryId) : undefined;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="w-[84px]">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveProduct(group, product.id, -1)}
                              disabled={isPending || !group.orderGroup || index === 0}
                              aria-label={`Move ${product.name} up`}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveProduct(group, product.id, 1)}
                              disabled={isPending || !group.orderGroup || index === group.products.length - 1}
                              aria-label={`Move ${product.name} down`}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          {product.isGoosebumps ? (
                            <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100">
                              Goosebumps
                            </Badge>
                          ) : cat ? (
                            <Badge variant="outline" className="text-muted-foreground capitalize">
                              {cat.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>₪{product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.size}</TableCell>
                        <TableCell>
                          <StatusBadge status={product.status} />
                        </TableCell>
                        <TableCell>
                          {product.images[0] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={product.images[0]}
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
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editProduct}
        onSubmit={handleFormSubmit}
        pending={isPending}
        categories={categories}
        defaultIsGoosebumps={mode === 'goosebumps'}
        defaultStatus={mode === 'archive' ? 'archive' : 'available'}
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
