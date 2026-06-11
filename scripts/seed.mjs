import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// 1-of-1 model: every product is a unique piece with a single size and stock 1.
const products = [
  { name: 'Signature Drop Tee',     price: 219.90, category: 'featured', size: 'M',  description: 'Our defining silhouette — heavyweight cotton with an extended hem and dropped shoulders.' },
  { name: 'Carpenter Pant',         price: 329.90, category: 'featured', size: '32', description: 'Workwear-derived with a hammer loop, ruler pocket, and a straight, full leg.' },
  { name: 'Mesh Tank',              price: 179.90, category: 'featured', size: 'L',  description: 'Open-weave mesh construction for layering or standalone wear in warmer months.' },
  { name: 'Crinkle Nylon Short',    price: 259.90, category: 'featured', size: '32', description: 'Lightweight crinkle nylon with an elastic waist and a mid-thigh inseam.' },
  { name: 'Thermal Henley',         price: 199.90, category: 'featured', size: 'M',  description: 'Waffle-knit thermal fabric with a classic three-button henley placket.' },
  { name: 'Classic Logo Tee',       price: 149.90, category: 'tees',     size: 'M',  description: 'A clean everyday tee with a tonal embroidered logo at the chest.' },
  { name: 'Heavyweight Blank Tee',  price: 169.90, category: 'tees',     size: 'L',  description: '320 gsm cotton jersey cut oversized for a substantial, structured silhouette.' },
  { name: 'Oversized Drop Shoulder', price: 189.90, category: 'tees',    size: 'XL', description: 'Extended drop-shoulder seam and a boxy fit designed to wear loose.' },
  { name: 'Pigment Dyed Crew',      price: 199.90, category: 'tees',     size: 'M',  description: 'Garment-dyed after construction for a faded, lived-in tone throughout.' },
  { name: 'Essential Rib Tee',      price: 139.90, category: 'tees',     size: 'S',  description: 'Fitted 1x1 rib fabric with a slightly cropped length and clean finish.' },
  { name: 'Vintage Wash Tee',       price: 179.90, category: 'tees',     size: 'M',  description: 'Stone-washed for a soft hand-feel and subtle surface variation.' },
  { name: 'Relaxed Cargo Pant',     price: 299.90, category: 'bottoms',  size: '32', description: 'Utility-inspired silhouette with side cargo pockets and a relaxed through the leg.' },
  { name: 'Wide Leg Twill Trouser', price: 349.90, category: 'bottoms',  size: '34', description: 'Structured twill fabric with a wide leg opening and a high, clean waistband.' },
  { name: 'Jersey Sweatpant',       price: 249.90, category: 'bottoms',  size: '32', description: 'Heavyweight French terry construction with a tapered leg and ribbed cuffs.' },
  { name: 'Chino Short',            price: 219.90, category: 'bottoms',  size: '30', description: 'Mid-thigh length in a cotton-twill blend with a straight, easy fit.' },
  { name: 'Track Pant',             price: 279.90, category: 'bottoms',  size: '32', description: 'Athletic-cut with contrast side taping and an elasticated ankle for a clean finish.' },
  { name: 'Denim Baggy Jean',       price: 389.90, category: 'bottoms',  size: '34', description: 'Raw-selvedge denim in a full baggy cut with minimal detailing.' },
];

async function seed() {
  const rows = products.map(({ size, ...rest }) => ({ ...rest, stock: 1, sizes: [size] }));
  const { error } = await supabase.from('products').insert(rows);
  if (error) throw error;
  console.log(`Seeded ${rows.length} products successfully.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
