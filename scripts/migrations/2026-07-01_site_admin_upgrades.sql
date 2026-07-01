-- Site admin upgrade: icons, navigation, content, typography, page backgrounds
-- Adds new site_settings JSON keys and products.display_order for ordering.

-- ── products.display_order ───────────────────────────────────────────────────

alter table products add column if not exists display_order integer not null default 0;

-- Backfill display_order from current ordering (created_at for lack of explicit order).
-- Existing products keep their relative order so the first deployment doesn't reshuffle.
update products
  set display_order = sub.pos
  from (
    select id, row_number() over (
      partition by coalesce(category_id, '00000000-0000-0000-0000-000000000000')
      order by id asc
    ) - 1 as pos
    from products
  ) sub
  where products.id = sub.id and products.display_order = 0;

create index if not exists products_display_order_idx on products(display_order);

-- ── New site_settings defaults ───────────────────────────────────────────────

insert into site_settings (key, value)
values
  (
    'icons',
    jsonb_build_object(
      'menu', jsonb_build_object('url', null, 'width', null, 'height', null),
      'cart', jsonb_build_object('url', null, 'width', null, 'height', null),
      'close', jsonb_build_object('url', null, 'width', null, 'height', null),
      'categoryArrow', jsonb_build_object('url', null, 'width', null, 'height', null),
      'whatsapp', jsonb_build_object('url', null, 'width', null, 'height', null),
      'accessibility', jsonb_build_object('url', null, 'width', null, 'height', null)
    )
  ),
  (
    'navigation',
    jsonb_build_object(
      'items', jsonb_build_array(
        jsonb_build_object('id', 'archive', 'label', 'Archive', 'href', '/archive', 'type', 'system', 'enabled', true, 'displayOrder', 1),
        jsonb_build_object('id', 'available', 'label', 'Available', 'href', '/available', 'type', 'system', 'enabled', true, 'displayOrder', 2),
        jsonb_build_object('id', 'goosebumps', 'label', 'Goosebumps', 'href', '/goosebumps', 'type', 'system', 'enabled', true, 'displayOrder', 3),
        jsonb_build_object('id', 'about', 'label', 'About', 'href', '/about', 'type', 'system', 'enabled', true, 'displayOrder', 4),
        jsonb_build_object('id', 'contact', 'label', 'Contact', 'href', '/contact', 'type', 'system', 'enabled', true, 'displayOrder', 5),
        jsonb_build_object('id', 'faq', 'label', 'FAQ', 'href', '/faq', 'type', 'system', 'enabled', true, 'displayOrder', 6)
      )
    )
  ),
  (
    'content',
    jsonb_build_object(
      'about', jsonb_build_object(
        'title', 'About',
        'body', $$Life happens in a random kind of way. If you make room for randomness in your life, to the unexpected things — you discover and experience wonderful things. And that philosophy gives me, bar, the place to create straight from my heart, to my hands. No stops on the way.

The constant insistence to not follow up a line, or a knot that I've already created is what gives me the way to create my unique pieces of wearable art.

Akra puts a spotlight on how I felt the day, the hour, the minute I decided to create.

A huge mix of feelings straight from my mind, onto my hands to your closet.

Every piece looks completely different on each body.

When you buy AKRA, you buy more than art — you buy your random self expression. The unexpected. Life itself.$$
      ),
      'contact', jsonb_build_object(
        'title', 'Contact',
        'intro', 'Questions about an order, a product, or a return? Reach us through the channels below.',
        'whatsappLabel', 'WhatsApp',
        'whatsappHref', 'https://wa.me/972500000000',
        'email', 'hello@akra.example',
        'businessId', 'To be provided'
      )
    )
  ),
  (
    'typography',
    jsonb_build_object(
      'defaults', jsonb_build_object(
        'pageTitle', jsonb_build_object('mobilePx', 24, 'desktopPx', 32),
        'sectionTitle', jsonb_build_object('mobilePx', 18, 'desktopPx', 24),
        'productTitle', jsonb_build_object('mobilePx', 14, 'desktopPx', 16),
        'productPrice', jsonb_build_object('mobilePx', 13, 'desktopPx', 14),
        'bodyText', jsonb_build_object('mobilePx', 14, 'desktopPx', 15),
        'navText', jsonb_build_object('mobilePx', 13, 'desktopPx', 14)
      ),
      'pages', '{}'::jsonb
    )
  ),
  (
    'page_backgrounds',
    jsonb_build_object(
      'home', jsonb_build_object('url', null, 'mode', 'none', 'size', 'cover', 'position', 'center', 'repeat', 'no-repeat'),
      'about', jsonb_build_object('url', null, 'mode', 'none', 'size', 'cover', 'position', 'center', 'repeat', 'no-repeat'),
      'contact', jsonb_build_object('url', null, 'mode', 'none', 'size', 'cover', 'position', 'center', 'repeat', 'no-repeat'),
      'available', jsonb_build_object('url', null, 'mode', 'none', 'size', 'cover', 'position', 'center', 'repeat', 'no-repeat'),
      'archive', jsonb_build_object('url', null, 'mode', 'none', 'size', 'cover', 'position', 'center', 'repeat', 'no-repeat'),
      'goosebumps', jsonb_build_object('url', null, 'mode', 'none', 'size', 'cover', 'position', 'center', 'repeat', 'no-repeat'),
      'faq', jsonb_build_object('url', null, 'mode', 'none', 'size', 'cover', 'position', 'center', 'repeat', 'no-repeat')
    )
  )
on conflict (key) do nothing;
