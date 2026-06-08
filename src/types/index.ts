export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

export interface ArchiveItem {
  id: string;
  imageUrl: string;
  xPosition: number;
  yPosition: number;
  size: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string | null;
  stock: number;
  description?: string;
  sizes?: string[];
  imageUrl?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  brandName: string;
  url: string;
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
  shipping: {
    flatFee: number;
    freeThreshold: number;
  };
}
