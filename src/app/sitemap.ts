import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/data-store';
import { siteConfig } from '@/config/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticPaths = [
    '',
    '/contact',
    '/legal/terms',
    '/legal/privacy',
    '/legal/returns',
    '/legal/accessibility',
  ];
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
  }));

  const products = await getProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/product/${p.id}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...productRoutes];
}
