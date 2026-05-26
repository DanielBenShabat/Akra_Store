import type { Product } from '@/types';

const TEE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BOTTOM_SIZES = ['28', '30', '32', '34', '36'];

export const tees: Product[] = [
  { id: 'tee-01', name: 'Classic Logo Tee',       price: 149.90, category: 'tees', stock: 12, sizes: TEE_SIZES,    description: 'A clean everyday tee with a tonal embroidered logo at the chest.' },
  { id: 'tee-02', name: 'Heavyweight Blank Tee',   price: 169.90, category: 'tees', stock: 3,  sizes: TEE_SIZES,    description: '320 gsm cotton jersey cut oversized for a substantial, structured silhouette.' },
  { id: 'tee-03', name: 'Oversized Drop Shoulder', price: 189.90, category: 'tees', stock: 8,  sizes: TEE_SIZES,    description: 'Extended drop-shoulder seam and a boxy fit designed to wear loose.' },
  { id: 'tee-04', name: 'Pigment Dyed Crew',       price: 199.90, category: 'tees', stock: 2,  sizes: TEE_SIZES,    description: 'Garment-dyed after construction for a faded, lived-in tone throughout.' },
  { id: 'tee-05', name: 'Essential Rib Tee',       price: 139.90, category: 'tees', stock: 20, sizes: TEE_SIZES,    description: 'Fitted 1x1 rib fabric with a slightly cropped length and clean finish.' },
  { id: 'tee-06', name: 'Vintage Wash Tee',        price: 179.90, category: 'tees', stock: 5,  sizes: TEE_SIZES,    description: 'Stone-washed for a soft hand-feel and subtle surface variation.' },
];

export const bottoms: Product[] = [
  { id: 'bot-01', name: 'Relaxed Cargo Pant',      price: 299.90, category: 'bottoms', stock: 6,  sizes: BOTTOM_SIZES, description: 'Utility-inspired silhouette with side cargo pockets and a relaxed through the leg.' },
  { id: 'bot-02', name: 'Wide Leg Twill Trouser',  price: 349.90, category: 'bottoms', stock: 4,  sizes: BOTTOM_SIZES, description: 'Structured twill fabric with a wide leg opening and a high, clean waistband.' },
  { id: 'bot-03', name: 'Jersey Sweatpant',         price: 249.90, category: 'bottoms', stock: 15, sizes: BOTTOM_SIZES, description: 'Heavyweight French terry construction with a tapered leg and ribbed cuffs.' },
  { id: 'bot-04', name: 'Chino Short',              price: 219.90, category: 'bottoms', stock: 1,  sizes: BOTTOM_SIZES, description: 'Mid-thigh length in a cotton-twill blend with a straight, easy fit.' },
  { id: 'bot-05', name: 'Track Pant',               price: 279.90, category: 'bottoms', stock: 9,  sizes: BOTTOM_SIZES, description: 'Athletic-cut with contrast side taping and an elasticated ankle for a clean finish.' },
  { id: 'bot-06', name: 'Denim Baggy Jean',         price: 389.90, category: 'bottoms', stock: 3,  sizes: BOTTOM_SIZES, description: 'Raw-selvedge denim in a full baggy cut with minimal detailing.' },
];

export const featured: Product[] = [
  { id: 'feat-01', name: 'Signature Drop Tee',    price: 219.90, category: 'featured', stock: 2,  sizes: TEE_SIZES,    description: 'Our defining silhouette — heavyweight cotton with an extended hem and dropped shoulders.' },
  { id: 'feat-02', name: 'Carpenter Pant',         price: 329.90, category: 'featured', stock: 7,  sizes: BOTTOM_SIZES, description: 'Workwear-derived with a hammer loop, ruler pocket, and a straight, full leg.' },
  { id: 'feat-03', name: 'Mesh Tank',              price: 179.90, category: 'featured', stock: 4,  sizes: TEE_SIZES,    description: 'Open-weave mesh construction for layering or standalone wear in warmer months.' },
  { id: 'feat-04', name: 'Crinkle Nylon Short',    price: 259.90, category: 'featured', stock: 11, sizes: BOTTOM_SIZES, description: 'Lightweight crinkle nylon with an elastic waist and a mid-thigh inseam.' },
  { id: 'feat-05', name: 'Thermal Henley',         price: 199.90, category: 'featured', stock: 3,  sizes: TEE_SIZES,    description: 'Waffle-knit thermal fabric with a classic three-button henley placket.' },
];

export const allProducts: Product[] = [...featured, ...tees, ...bottoms];
