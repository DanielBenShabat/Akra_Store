'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ImageIcon, Loader2, X } from 'lucide-react';
import type { Product, Category, ProductStatus } from '@/types';
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
import { Button } from '@/components/admin-ui/button';
import { Label } from '@/components/admin-ui/label';
import { uploadProductImageAction } from './actions';
import { cn } from '@/lib/utils';

const SIZE_OPTIONS = ['One Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const STATUS_OPTIONS: Array<{ value: ProductStatus; label: string; description: string }> = [
  { value: 'available', label: 'Available', description: 'Shown in the shop and can be purchased.' },
  { value: 'unavailable', label: 'Unavailable', description: 'Hidden from shoppers / sold out.' },
  { value: 'archive', label: 'Archive', description: 'Shown on Archive only, no price and not clickable.' },
];

const productSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    price: z.number().positive('Must be positive'),
    categoryId: z.string(),
    description: z.string().optional(),
    size: z.string().min(1, 'Size is required'),
    images: z.array(z.string()),
    isGoosebumps: z.boolean(),
    status: z.enum(['available', 'unavailable', 'archive']),
  })
  .refine((d) => d.isGoosebumps || d.categoryId.length > 0, {
    path: ['categoryId'],
    message: 'Select a category',
  });

export interface ProductFormSubmitData {
  product: Omit<Product, 'id'>;
}

type ProductFormValues = z.infer<typeof productSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: ProductFormSubmitData) => void;
  pending: boolean;
  categories: Category[];
  defaultIsGoosebumps?: boolean;
  defaultStatus?: ProductStatus;
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  pending,
  categories,
  defaultIsGoosebumps = false,
  defaultStatus = 'available',
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      categoryId: '',
      description: '',
      size: 'One Size',
      images: [],
      isGoosebumps: false,
      status: 'available',
    },
  });

  const isGoosebumps = form.watch('isGoosebumps');
  const images = form.watch('images');

  useEffect(() => {
    if (open) {
      form.reset(
        product
          ? {
              name: product.name,
              price: product.price,
              categoryId: product.categoryId ?? '',
              description: product.description ?? '',
              size: product.size,
              images: product.images,
              isGoosebumps: product.isGoosebumps,
              status: product.status,
            }
          : {
              name: '',
                price: 0,
                categoryId: defaultIsGoosebumps ? '' : (categories[0]?.id ?? ''),
                description: '',
              size: 'One Size',
              images: [],
              isGoosebumps: defaultIsGoosebumps,
              status: defaultStatus,
            }
      );
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open, product, form, categories, defaultIsGoosebumps, defaultStatus]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (selected.length === 0) return;

    const valid: File[] = [];
    for (const file of selected) {
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is too large (max 8MB) and was skipped.`);
      } else {
        valid.push(file);
      }
    }
    if (valid.length === 0) return;

    setIsUploading(true);
    try {
      const results = await Promise.allSettled(
        valid.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const result = await uploadProductImageAction(formData);
          if (result.error || !result.url) throw new Error(result.error ?? 'Upload failed');
          return result.url;
        }),
      );

      const urls = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map((r) => r.value);
      const failed = results.length - urls.length;

      if (urls.length > 0) {
        form.setValue('images', [...form.getValues('images'), ...urls], { shouldValidate: true });
      }
      if (failed > 0) {
        toast.error(`${failed} image${failed > 1 ? 's' : ''} failed to upload.`);
      }
    } catch {
      toast.error('Upload failed. Check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage(index: number) {
    form.setValue(
      'images',
      form.getValues('images').filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  }

  const handleSubmit = form.handleSubmit((data) => {
    const product: Omit<Product, 'id'> = {
      name: data.name,
      price: data.price,
      stock: data.status === 'available' ? 1 : 0,
      isGoosebumps: data.isGoosebumps,
      categoryId: data.isGoosebumps || !data.categoryId ? null : data.categoryId,
      description: data.description || undefined,
      images: data.images,
      size: data.size,
      status: data.status,
    };

    onSubmit({ product });
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
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isGoosebumps"
              render={({ field }) => (
                <FormItem>
                  <button
                    type="button"
                    aria-pressed={field.value}
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between rounded-md border border-border p-4 text-left transition-all duration-150 active:scale-[0.98]',
                      field.value
                        ? 'border-foreground bg-foreground text-background shadow-md'
                        : 'bg-background hover:border-foreground hover:shadow-sm',
                    )}
                  >
                    <span className="text-sm font-medium">Add to Goosebumps Collection</span>
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                        field.value
                          ? 'border-background text-background'
                          : 'border-border text-muted-foreground',
                      )}
                    >
                      {field.value ? '✓' : '○'}
                    </span>
                  </button>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item status</FormLabel>
                  <div className="grid gap-2">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={field.value === option.value}
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'flex w-full cursor-pointer items-center justify-between rounded-md border border-border p-3 text-left transition-all duration-150 active:scale-[0.98]',
                          field.value === option.value
                            ? 'border-foreground bg-foreground text-background shadow-md'
                            : 'bg-background hover:border-foreground hover:shadow-sm',
                        )}
                      >
                        <span>
                          <span className="block text-sm font-medium">{option.label}</span>
                          <span className={cn('block text-xs', field.value === option.value ? 'text-background/70' : 'text-muted-foreground')}>
                            {option.description}
                          </span>
                        </span>
                        <span
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                            field.value === option.value
                              ? 'border-background text-background'
                              : 'border-border text-muted-foreground',
                          )}
                        >
                          {field.value === option.value ? '✓' : '○'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <FormMessage />
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

            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="space-y-3">
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {images.map((url, index) => (
                      <div
                        key={url}
                        className="relative w-24 h-24 rounded-md overflow-hidden border border-border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                        {index === 0 && (
                          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[10px] text-white">
                            Primary
                          </span>
                        )}
                        {!isUploading && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 z-10 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <label
                  htmlFor="product-image-input"
                  className={`flex items-center justify-center gap-2 w-full cursor-pointer rounded-md border border-foreground bg-foreground px-3 py-3 text-sm font-semibold text-background shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-md active:translate-y-0 active:scale-[0.98] ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span>Uploading images…</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 shrink-0" />
                      <span>{images.length > 0 ? 'Add more images' : 'Choose images'}</span>
                    </>
                  )}
                  <input
                    id="product-image-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
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
              <Button
                type="submit"
                disabled={pending || isUploading}
                className="bg-foreground px-8 text-background shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-md active:translate-y-0 active:scale-[0.97]"
              >
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
