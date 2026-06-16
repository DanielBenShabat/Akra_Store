import 'server-only';
import { supabase } from './supabase';
import { calculateTotals, type OrderTotals } from './pricing';
import type { Product, Category, ArchiveItem, ShippingMethod } from '@/types';

type DbProduct = {
  id: string;
  name: string;
  price: number;
  category_id: string | null;
  stock: number;
  description: string | null;
  sizes: string[] | null;
  image_urls: string[] | null;
  is_goosebumps: boolean;
};

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
};

function toProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    categoryId: row.category_id ?? null,
    stock: row.stock,
    description: row.description ?? undefined,
    size: row.sizes && row.sizes.length > 0 ? row.sizes[0] : 'One Size',
    images: row.image_urls ?? [],
    isGoosebumps: row.is_goosebumps,
  };
}

function toCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    displayOrder: row.display_order,
  };
}

function toRow(data: Partial<Omit<Product, 'id'>>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ('name' in data) row.name = data.name;
  if ('price' in data) row.price = data.price;
  if ('stock' in data) row.stock = data.stock;
  if ('description' in data) row.description = data.description ?? null;
  if ('size' in data) row.sizes = data.size ? [data.size] : null;
  if ('images' in data) row.image_urls = data.images && data.images.length ? data.images : null;
  if ('categoryId' in data) row.category_id = data.categoryId ?? null;
  if ('isGoosebumps' in data) row.is_goosebumps = data.isGoosebumps;
  return row;
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw new Error(error.message);
  return (data as DbProduct[]).map(toProduct);
}

export async function getGoosebumpsProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_goosebumps', true);
  if (error) throw new Error(error.message);
  return (data as DbProduct[]).map(toProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toProduct(data as DbProduct) : undefined;
}

export async function createProduct(
  data: Omit<Product, 'id' | 'stock'>,
): Promise<Product> {
  const { data: created, error } = await supabase
    .from('products')
    .insert(toRow({ ...data, stock: 1 }))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toProduct(created as DbProduct);
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id'>>,
): Promise<Product> {
  const { data: updated, error } = await supabase
    .from('products')
    .update(toRow(data))
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (!updated) throw new Error(`Product ${id} not found`);
  return toProduct(updated as DbProduct);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as DbCategory[]).map(toCategory);
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}

export async function getCategoriesWithProducts(): Promise<CategoryWithProducts[]> {
  const [cats, prods] = await Promise.all([getCategories(), getProducts()]);

  const byCategory = new Map<string, Product[]>();
  for (const p of prods) {
    if (p.isGoosebumps) continue;
    if (!p.categoryId) continue;
    if (!byCategory.has(p.categoryId)) byCategory.set(p.categoryId, []);
    byCategory.get(p.categoryId)!.push(p);
  }

  return cats.map((cat) => ({
    ...cat,
    products: byCategory.get(cat.id) ?? [],
  }));
}

export async function createCategory(name: string): Promise<Category> {
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

  const { data: last } = await supabase
    .from('categories')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = last ? (last.display_order as number) + 1 : 0;

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name.trim(), slug, display_order: nextOrder })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toCategory(data as DbCategory);
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
  const { data, error } = await supabase
    .from('categories')
    .update({ name: name.trim(), slug })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toCategory(data as DbCategory);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Archive ───────────────────────────────────────────────────────────────────

type DbArchiveItem = {
  id: string;
  image_url: string;
  x_position: number;
  y_position: number;
  size: number;
};

function toArchiveItem(row: DbArchiveItem): ArchiveItem {
  return {
    id: row.id,
    imageUrl: row.image_url,
    xPosition: row.x_position,
    yPosition: row.y_position,
    size: row.size,
  };
}

function toArchiveRow(data: Partial<Omit<ArchiveItem, 'id'>>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ('imageUrl' in data) row.image_url = data.imageUrl;
  if ('xPosition' in data) row.x_position = data.xPosition;
  if ('yPosition' in data) row.y_position = data.yPosition;
  if ('size' in data) row.size = data.size;
  return row;
}

export async function getArchiveItems(): Promise<ArchiveItem[]> {
  const { data, error } = await supabase
    .from('archive_items')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as DbArchiveItem[]).map(toArchiveItem);
}

export async function createArchiveItem(data: Omit<ArchiveItem, 'id'>): Promise<ArchiveItem> {
  const { data: created, error } = await supabase
    .from('archive_items')
    .insert(toArchiveRow(data))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toArchiveItem(created as DbArchiveItem);
}

export async function updateArchiveItem(
  id: string,
  data: Partial<Omit<ArchiveItem, 'id'>>,
): Promise<ArchiveItem> {
  const { data: updated, error } = await supabase
    .from('archive_items')
    .update(toArchiveRow(data))
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (!updated) throw new Error(`Archive item ${id} not found`);
  return toArchiveItem(updated as DbArchiveItem);
}

export async function deleteArchiveItem(id: string): Promise<void> {
  const { error } = await supabase.from('archive_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface OrderSummary {
  id: string;
  total: number;
  status: string;
}

export async function getOrderById(id: string): Promise<OrderSummary | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, total, status')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data as OrderSummary) : null;
}

export interface OrderRow {
  id: string;
  first_name: string;
  last_name: string;
  shipping_method: ShippingMethod;
  total: number;
  status: string;
  created_at: string;
}

export async function getOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, first_name, last_name, shipping_method, total, status, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as OrderRow[];
}

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface CreatePendingOrderInput {
  productId: string;
  size: string;
  quantity: number;
  shippingMethod: ShippingMethod;
  shipping: ShippingDetails;
}

/**
 * Recalculate order totals from the authoritative product price for a given
 * shipping method. Used by the checkout UI to quote totals in real time
 * without ever trusting client-supplied prices.
 */
export async function quoteOrderTotals(
  productId: string,
  method: ShippingMethod,
): Promise<OrderTotals> {
  const { data: product, error } = await supabase
    .from('products')
    .select('price')
    .eq('id', productId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!product) throw new Error('This product is no longer available');
  return calculateTotals(product.price, method);
}

export async function createPendingOrder(
  input: CreatePendingOrderInput,
): Promise<{ orderId: string }> {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, price, stock')
    .eq('id', input.productId)
    .maybeSingle();
  if (productError) throw new Error(productError.message);
  if (!product) throw new Error('This product is no longer available');
  if (product.stock < input.quantity) throw new Error(`${product.name} is out of stock`);

  const subtotal = product.price * input.quantity;
  const totals = calculateTotals(subtotal, input.shippingMethod);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      first_name: input.shipping.firstName,
      last_name: input.shipping.lastName,
      email: input.shipping.email,
      phone: input.shipping.phone,
      address: input.shipping.address,
      city: input.shipping.city,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      shipping_method: input.shippingMethod,
      total: totals.total,
      status: 'pending',
    })
    .select('id')
    .single();
  if (orderError || !order) throw new Error(orderError?.message ?? 'Failed to create order');

  const { error: itemError } = await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    name: product.name,
    size: input.size,
    price: product.price,
    quantity: input.quantity,
  });
  if (itemError) throw new Error(itemError.message);

  return { orderId: order.id as string };
}

export async function updateOrderStatus(
  orderId: string,
  outcome: 'paid' | 'failed',
): Promise<void> {
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle();
  if (fetchError) throw new Error(fetchError.message);
  if (!order) throw new Error('Order not found');
  if (order.status !== 'pending') return;

  if (outcome === 'failed') {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', orderId);
  if (updateError) throw new Error(updateError.message);

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId);
  if (itemsError) throw new Error(itemsError.message);

  for (const item of items ?? []) {
    await supabase.rpc('decrement_product_stock', {
      p_id: item.product_id,
      qty: item.quantity,
    });
  }
}
