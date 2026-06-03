import 'server-only';
import { supabase } from './supabase';
import type { Product, ProductCategory } from '@/types';

type DbProduct = {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  stock: number;
  description: string | null;
  sizes: string[] | null;
  image_url: string | null;
};

function toProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    stock: row.stock,
    description: row.description ?? undefined,
    sizes: row.sizes ?? undefined,
    imageUrl: row.image_url ?? undefined,
  };
}

function toRow(data: Partial<Omit<Product, 'id'>>) {
  const row: Record<string, unknown> = { ...data };
  if ('imageUrl' in row) {
    row.image_url = row.imageUrl ?? null;
    delete row.imageUrl;
  }
  return row;
}

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
