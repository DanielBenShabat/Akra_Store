'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ImageIcon, Loader2, X } from 'lucide-react';
import type { ArchiveItem } from '@/types';
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
import { Button } from '@/components/admin-ui/button';
import { Label } from '@/components/admin-ui/label';
import { uploadArchiveImageAction } from './actions';

const archiveSchema = z.object({
  imageUrl: z.string().min(1, 'Image is required'),
  xPosition: z.number().min(0, 'Min 0').max(100, 'Max 100'),
  yPosition: z.number().min(0, 'Min 0').max(100, 'Max 100'),
  size: z.number().min(10, 'Min 10').max(100, 'Max 100'),
});

type ArchiveFormValues = z.infer<typeof archiveSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ArchiveItem | null;
  onSubmit: (data: ArchiveFormValues) => void;
  pending: boolean;
}

export default function ArchiveItemFormDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  pending,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ArchiveFormValues>({
    resolver: zodResolver(archiveSchema),
    defaultValues: { imageUrl: '', xPosition: 0, yPosition: 0, size: 30 },
  });

  const values = form.watch();

  useEffect(() => {
    if (open) {
      form.reset(
        item
          ? {
              imageUrl: item.imageUrl,
              xPosition: item.xPosition,
              yPosition: item.yPosition,
              size: item.size,
            }
          : { imageUrl: '', xPosition: 0, yPosition: 0, size: 30 }
      );
      setPreviewUrl(item?.imageUrl ?? null);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open, item, form]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadArchiveImageAction(formData);

    if (result.error) {
      toast.error(`Upload failed: ${result.error}`);
      setPreviewUrl(form.getValues('imageUrl') || null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      form.setValue('imageUrl', result.url!, { shouldValidate: true });
      setPreviewUrl(result.url!);
    }

    setIsUploading(false);
  }

  function clearImage() {
    form.setValue('imageUrl', '', { shouldValidate: true });
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSubmit = form.handleSubmit((data) => onSubmit(data));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Archive Item' : 'Add Archive Item'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Image</Label>
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
                  htmlFor="archive-image-input"
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
                    id="archive-image-input"
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="xPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>X (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
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
                name="yPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Y (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
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
                    <FormLabel>Size (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="10"
                        max="100"
                        step="0.1"
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

            <div className="space-y-2">
              <Label>Live Preview</Label>
              <div className="relative w-full aspect-square rounded-md border border-border bg-muted overflow-hidden">
                {previewUrl && (
                  <div
                    className="absolute"
                    style={{
                      left: `${values.xPosition || 0}%`,
                      top: `${values.yPosition || 0}%`,
                      width: `${values.size || 10}%`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="" className="w-full h-auto block" />
                  </div>
                )}
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
                ) : item ? (
                  'Save Changes'
                ) : (
                  'Add Item'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
