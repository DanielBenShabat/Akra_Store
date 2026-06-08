'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ImageIcon, Loader2, X } from 'lucide-react';
import type { Product, Category } from '@/types';
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
import { Switch } from '@/components/admin-ui/switch';
import { Button } from '@/components/admin-ui/button';
import { Label } from '@/components/admin-ui/label';
import { uploadProductImageAction } from './actions';

const TEE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BOTTOM_SIZES = ['28', '30', '32', '34', '36'];
const ALL_SIZES = [...TEE_SIZES, ...BOTTOM_SIZES];

const productSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    price: z.number().positive('Must be positive'),
    categoryId: z.string(),
    stock: z.number().int().min(0, 'Cannot be negative'),
    description: z.string().optional(),
    sizes: z.array(z.string()).optional(),
    imageUrl: z.string().optional(),
    isGoosebumps: z.boolean(),
  })
  .refine((d) => d.isGoosebumps || d.categoryId.length > 0, {
    path: ['categoryId'],
    message: 'Select a category',
  });

type ProductFormValues = z.infer<typeof productSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id'>) => void;
  pending: boolean;
  categories: Category[];
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  pending,
  categories,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      categoryId: '',
      stock: 0,
      description: '',
      sizes: [],
      imageUrl: '',
      isGoosebumps: false,
    },
  });

  const isGoosebumps = form.watch('isGoosebumps');

  useEffect(() => {
    if (open) {
      form.reset(
        product
          ? {
              name: product.name,
              price: product.price,
              categoryId: product.categoryId ?? '',
              stock: product.stock,
              description: product.description ?? '',
              sizes: product.sizes ?? [],
              imageUrl: product.imageUrl ?? '',
              isGoosebumps: product.isGoosebumps,
            }
          : {
              name: '',
              price: 0,
              categoryId: categories[0]?.id ?? '',
              stock: 0,
              description: '',
              sizes: [],
              imageUrl: '',
              isGoosebumps: false,
            }
      );
      setPreviewUrl(product?.imageUrl ?? null);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open, product, form, categories]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadProductImageAction(formData);

    if (result.error) {
      toast.error(`Upload failed: ${result.error}`);
      setPreviewUrl(form.getValues('imageUrl') || null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      form.setValue('imageUrl', result.url!);
      setPreviewUrl(result.url!);
    }

    setIsUploading(false);
  }

  function clearImage() {
    form.setValue('imageUrl', '');
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSubmit = form.handleSubmit((data) => {
    const cleaned: Omit<Product, 'id'> = {
      name: data.name,
      price: data.price,
      stock: data.stock,
      isGoosebumps: data.isGoosebumps,
      categoryId: data.isGoosebumps || !data.categoryId ? null : data.categoryId,
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
                        value={Number.isNaN(field.value) ? '' : field.value}
                        onChange={(e) => {
                          const v = e.target.valueAsNumber;
                          field.onChange(Number.isNaN(v) ? undefined : v);
                        }}
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
                        value={Number.isNaN(field.value) ? '' : field.value}
                        onChange={(e) => {
                          const v = e.target.valueAsNumber;
                          field.onChange(Number.isNaN(v) ? undefined : v);
                        }}
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
              name="isGoosebumps"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Add to Goosebumps Collection</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Goosebumps products appear on the Goosebumps page and are excluded from Available.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {!isGoosebumps && (
              <FormField
                control={form.control}
                name="categoryId"
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
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="space-y-3">
                {previewUrl && (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden border border-border">
                    {isUploading && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-1 right-1 z-10 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}

                <label
                  htmlFor="product-image-input"
                  className={`flex items-center gap-2 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span>Uploading image…</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 shrink-0" />
                      <span>{previewUrl ? 'Replace image' : 'Choose image'}</span>
                    </>
                  )}
                  <input
                    id="product-image-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={isUploading}
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={pending || isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : pending ? (
                  'Saving…'
                ) : product ? (
                  'Save Changes'
                ) : (
                  'Add Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
