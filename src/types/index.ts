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

export type ProductStatus = 'available' | 'unavailable' | 'archive';

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
  status: ProductStatus;
}

/**
 * How an order is fulfilled:
 * - `express`  — courier to address, up to 3 business days (40₪, free over threshold)
 * - `standard` — courier to address, up to 10 business days (25₪, free over threshold)
 * - `pickup`   — self-pickup, Modi'in area by prior arrangement (free)
 */
export type ShippingMethod = 'express' | 'standard' | 'pickup';

/**
 * A line in the cart / checkout. Under the 1-of-1 model every entry is a unique
 * product with an implicit quantity of 1, so there is no `quantity` field here.
 */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  image: string | null;
}

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  street: string;
  houseNumber: string;
  postalCode: string | null;
  subtotal: number;
  shipping: number;
  shippingMethod: ShippingMethod;
  total: number;
  paymentReference: string | null;
  paymentProvider: string | null;
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
