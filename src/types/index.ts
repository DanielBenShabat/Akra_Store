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
  size: string;
  images: string[];
  isGoosebumps: boolean;
}

/** How an order is fulfilled. `home` = courier to address, `pickup` = pick-up point. */
export type ShippingMethod = 'home' | 'pickup';

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  subtotal: number;
  shipping: number;
  shippingMethod: ShippingMethod;
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
    /** Subtotal at which `home` delivery becomes free. */
    freeThreshold: number;
    /** Per-method configuration. `flatFee` is the base rate used by server-side pricing. */
    methods: Record<
      ShippingMethod,
      {
        label: string;
        description: string;
        flatFee: number;
      }
    >;
  };
}
