import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Static, predictable UUIDs that mirror the live categories so seeded products
// reference valid category rows in any fresh or existing database.
const categories = [
  { id: '0328db0c-06e7-4555-bcd0-4981b869f94d', name: 'tamar top',      slug: 'tamar-top',      display_order: 0 },
  { id: '6453aced-2bd5-45b2-9a9f-9ae7554e4b2d', name: 'pollock',        slug: 'pollock',        display_order: 1 },
  { id: 'fb393fb4-4ae6-4dbc-a085-f524486c17cc', name: 'finger print',   slug: 'finger-print',   display_order: 2 },
  { id: 'dc9784a4-641a-4b03-b680-9d9b2ca7997e', name: 'lemon triangle', slug: 'lemon-triangle', display_order: 3 },
];

const categoryIdBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

// 1-of-1 model: each product is a unique piece with a single size and stock 1.
// `category` is a category slug; `goosebumps: true` items carry no category.
const products = [
  { name: 'Signature Drop Tee',     price: 219.90, category: 'tamar-top',      size: 'M'  },
  { name: 'Carpenter Pant',         price: 329.90, category: 'pollock',        size: '32' },
  { name: 'Mesh Tank',              price: 179.90, category: 'finger-print',   size: 'L'  },
  { name: 'Crinkle Nylon Short',    price: 259.90, category: 'lemon-triangle', size: '32' },
  { name: 'Thermal Henley',         price: 199.90, category: 'tamar-top',      size: 'M'  },
  { name: 'Classic Logo Tee',       price: 149.90, category: 'pollock',        size: 'M'  },
  { name: 'Heavyweight Blank Tee',  price: 169.90, category: 'finger-print',   size: 'L'  },
  { name: 'Oversized Drop Shoulder', price: 189.90, goosebumps: true,          size: 'XL' },
  { name: 'Pigment Dyed Crew',      price: 199.90, category: 'lemon-triangle', size: 'M'  },
  { name: 'Essential Rib Tee',      price: 139.90, category: 'tamar-top',      size: 'S'  },
  { name: 'Vintage Wash Tee',       price: 179.90, category: 'pollock',        size: 'M'  },
  { name: 'Relaxed Cargo Pant',     price: 299.90, category: 'finger-print',   size: '32' },
  { name: 'Wide Leg Twill Trouser', price: 349.90, goosebumps: true,          size: '34' },
  { name: 'Jersey Sweatpant',       price: 249.90, category: 'lemon-triangle', size: '32' },
  { name: 'Chino Short',            price: 219.90, category: 'tamar-top',      size: '30' },
  { name: 'Track Pant',             price: 279.90, category: 'pollock',        size: '32' },
  { name: 'Denim Baggy Jean',       price: 389.90, goosebumps: true,          size: '34' },
];

async function seed() {
  const { error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'id' });
  if (catError) throw catError;
  console.log(`Seeded ${categories.length} categories.`);

  const rows = products.map(({ category, goosebumps, size, ...rest }) => ({
    ...rest,
    stock: 1,
    sizes: [size],
    is_goosebumps: Boolean(goosebumps),
    category_id: goosebumps ? null : categoryIdBySlug[category],
  }));

  const { error: productError } = await supabase.from('products').insert(rows);
  if (productError) throw productError;
  console.log(`Seeded ${rows.length} products successfully.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
