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
  isGoosebumps: boolean;
}

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  subtotal: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
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
