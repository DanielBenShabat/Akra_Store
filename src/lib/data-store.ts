import 'server-only';
import { supabase } from './supabase';
import type { Product, Category } from '@/types';

type DbProduct = {
  id: string;
  name: string;
  price: number;
  category_id: string | null;
  stock: number;
  description: string | null;
  sizes: string[] | null;
  image_url: string | null;
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
    sizes: row.sizes ?? undefined,
    imageUrl: row.image_url ?? undefined,
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
  if ('sizes' in data) row.sizes = data.sizes ?? null;
  if ('imageUrl' in data) row.image_url = data.imageUrl ?? null;
  if ('categoryId' in data) row.category_id = data.categoryId ?? null;
  return row;
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*');
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

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  const { data: created, error } = await supabase
    .from('products')
    .insert(toRow(data))
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

// ── Orders ────────────────────────────────────────────────────────────────────

export interface OrderSummary {
  id: string;
  total: number;
  currency: string;
  status: string;
}

export async function getOrderById(id: string): Promise<OrderSummary | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, total, currency, status')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data as OrderSummary) : null;
}

export interface OrderRow {
  id: string;
  first_name: string;
  last_name: string;
  total: number;
  currency: string;
  status: string;
  created_at: string;
}

export async function getOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, first_name, last_name, total, currency, status, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as OrderRow[];
}
