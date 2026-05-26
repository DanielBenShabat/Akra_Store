export type ProductCategory = 'tees' | 'bottoms' | 'accessories' | 'socks' | 'featured';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  stock: number;
  description?: string;
  sizes?: string[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  brandName: string;
  nav: NavItem[];
  featuredCollectionTitle: string;
  footer: {
    copyright: string;
  };
  social: {
    whatsappHref: string;
  };
  currency: {
    code: string;
    symbol: string;
  };
}
