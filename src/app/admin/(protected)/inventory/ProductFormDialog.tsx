'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Product, ProductCategory } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/admin-ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/admin-ui/form';
import { Input } from '@/components/admin-ui/input';
import { Textarea } from '@/components/admin-ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin-ui/select';
import { Checkbox } from '@/components/admin-ui/checkbox';
import { Button } from '@/components/admin-ui/button';
import { Label } from '@/components/admin-ui/label';

const TEE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BOTTOM_SIZES = ['28', '30', '32', '34', '36'];
const ALL_SIZES = [...TEE_SIZES, ...BOTTOM_SIZES];

const CATEGORIES: ProductCategory[] = ['tees', 'bottoms', 'accessories', 'socks', 'featured'];

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Must be positive'),
  category: z.enum(['tees', 'bottoms', 'accessories', 'socks', 'featured'] as [ProductCategory, ...ProductCategory[]]),
  stock: z.number().int().min(0, 'Cannot be negative'),
  description: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: ProductFormValues) => void;
  pending: boolean;
}

export default function ProductFormDialog({ open, onOpenChange, product, onSubmit, pending }: Props) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      category: 'tees',
      stock: 0,
      description: '',
      sizes: [],
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        product
          ? {
              name: product.name,
              price: product.price,
              category: product.category,
              stock: product.stock,
              description: product.description ?? '',
              sizes: product.sizes ?? [],
              imageUrl: product.imageUrl ?? '',
            }
          : { name: '', price: 0, category: 'tees', stock: 0, description: '', sizes: [], imageUrl: '' }
      );
    }
  }, [open, product, form]);

  const handleSubmit = form.handleSubmit((data) => {
    const cleaned: ProductFormValues = {
      ...data,
      description: data.description || undefined,
      imageUrl: data.imageUrl || undefined,
      sizes: data.sizes?.length ? data.sizes : undefined,
    };
    onSubmit(cleaned);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₪)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product description (optional)" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sizes</FormLabel>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {ALL_SIZES.map((size) => (
                      <div key={size} className="flex items-center gap-1.5">
                        <Checkbox
                          id={`size-${size}`}
                          checked={field.value?.includes(size) ?? false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value ?? []), size]);
                            } else {
                              field.onChange((field.value ?? []).filter((s) => s !== size));
                            }
                          }}
                        />
                        <Label htmlFor={`size-${size}`} className="text-sm font-normal cursor-pointer">
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
