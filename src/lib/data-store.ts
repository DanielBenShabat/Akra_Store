import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { Product } from '@/types';
import { allProducts as seedData } from './mock-data';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  }
}

async function readAll(): Promise<Product[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Product[];
}

async function writeAll(products: Product[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

export async function getProducts(): Promise<Product[]> {
  return readAll();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await readAll();
  return products.find((p) => p.id === id);
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  const products = await readAll();
  const product: Product = { id: crypto.randomUUID(), ...data };
  await writeAll([...products, product]);
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id'>>,
): Promise<Product> {
  const products = await readAll();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error(`Product ${id} not found`);
  const updated = { ...products[index], ...data };
  products[index] = updated;
  await writeAll(products);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await readAll();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) throw new Error(`Product ${id} not found`);
  await writeAll(filtered);
}
