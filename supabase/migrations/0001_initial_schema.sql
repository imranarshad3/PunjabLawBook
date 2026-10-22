-- Punjab Law Book House — admin schema
-- Covers every module in /admin: books, categories, collections, media,
-- inventory, orders, customers, enquiries, promotions, website content,
-- settings and team access.
--
-- Identity: Clerk. Supabase sees the Clerk JWT, so `auth.jwt() ->> 'sub'`
-- is the Clerk user id. Enable Clerk as a third-party auth provider in
-- Supabase (Authentication → Sign In / Providers → Clerk) for RLS to apply
-- to authenticated admin requests.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- helpers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.clerk_user_id()
returns text language sql stable as $$
  select coalesce(auth.jwt() ->> 'sub', '')
$$;

-- ------------------------------------------------------------ team access
create table if not exists public.admin_members (
  id            uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email         text,
  full_name     text,
  role          text not null default 'editor'
                check (role in ('owner', 'admin', 'editor', 'viewer')),
  invited_by    uuid references public.admin_members (id) on delete set null,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_members m
    where m.clerk_user_id = public.clerk_user_id()
  )
$$;

create or replace function public.has_role(required text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_members m
    where m.clerk_user_id = public.clerk_user_id()
      and m.role = any(required)
  )
$$;

-- ------------------------------------------------------------- categories
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  icon        text not null default 'book',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------------ books
create table if not exists public.books (
  id                  uuid primary key default gen_random_uuid(),
  legacy_id           integer unique,            -- storefront product id
  slug                text unique not null,
  title               text not null,
  author              text,
  publisher           text,
  isbn                text,
  language            text not null default 'English',
  edition             text,
  pages               integer check (pages is null or pages > 0),
  category_id         uuid references public.categories (id) on delete set null,
  price               numeric(10, 2) not null default 0 check (price >= 0),
  compare_at_price    numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  cost_price          numeric(10, 2) check (cost_price is null or cost_price >= 0),
  -- null means "not tracked yet" rather than "zero on hand"
  stock               integer check (stock is null or stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  stock_status        text generated always as (
                        case
                          when stock is null then 'untracked'
                          when stock <= 0 then 'out_of_stock'
                          when stock <= low_stock_threshold then 'low_stock'
                          else 'in_stock'
                        end
                      ) stored,
  status              text not null default 'draft'
                      check (status in ('draft', 'published', 'archived')),
  description         text,
  cover_url           text,
  publication_date    date,
  meta_title          text,
  meta_description    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists books_category_idx on public.books (category_id);
create index if not exists books_status_idx on public.books (status);
create index if not exists books_stock_status_idx on public.books (stock_status);
create index if not exists books_title_idx on public.books using gin (to_tsvector('simple', title));

-- ------------------------------------------------------------ collections
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.collection_books (
  collection_id uuid not null references public.collections (id) on delete cascade,
  book_id       uuid not null references public.books (id) on delete cascade,
  sort_order    integer not null default 0,
  primary key (collection_id, book_id)
);

-- ---------------------------------------------------------- media library
create table if not exists public.media_assets (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid references public.books (id) on delete cascade,
  url         text not null,
  alt_text    text,
  kind        text not null default 'cover'
              check (kind in ('cover', 'banner', 'gallery', 'document')),
  width       integer,
  height      integer,
  byte_size   integer,
  content_type text,
  created_at  timestamptz not null default now()
);

create index if not exists media_assets_book_idx on public.media_assets (book_id);

-- -------------------------------------------------------------- customers
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,
  full_name     text not null,
  email         text,
  phone         text,
  city          text,
  address       text,
  notes         text,
  status        text not null default 'active'
                check (status in ('active', 'inactive', 'blocked')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists customers_email_idx
  on public.customers (lower(email)) where email is not null;

-- ----------------------------------------------------------------- orders
create sequence if not exists public.order_number_seq start 3200;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique not null
                   default ('PB' || lpad(nextval('public.order_number_seq')::text, 5, '0')),
  customer_id      uuid references public.customers (id) on delete set null,
  customer_name    text not null,
  customer_email   text,
  customer_phone   text,
  status           text not null default 'pending'
                   check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status   text not null default 'unpaid'
                   check (payment_status in ('unpaid', 'paid', 'refunded', 'failed')),
  payment_method   text,
  subtotal         numeric(10, 2) not null default 0 check (subtotal >= 0),
  shipping_fee     numeric(10, 2) not null default 0 check (shipping_fee >= 0),
  discount_total   numeric(10, 2) not null default 0 check (discount_total >= 0),
  total            numeric(10, 2) not null default 0 check (total >= 0),
  promotion_id     uuid,
  shipping_address text,
  shipping_city    text,
  tracking_number  text,
  notes            text,
  placed_at        timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_customer_idx on public.orders (customer_id);
create index if not exists orders_placed_at_idx on public.orders (placed_at desc);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  book_id    uuid references public.books (id) on delete set null,
  title      text not null,              -- snapshot, survives book edits
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity   integer not null default 1 check (quantity > 0),
  line_total numeric(10, 2) generated always as (unit_price * quantity) stored
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- -------------------------------------------------------------- inventory
create table if not exists public.inventory_movements (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid not null references public.books (id) on delete cascade,
  delta      integer not null,
  reason     text not null default 'adjustment'
             check (reason in ('adjustment', 'restock', 'sale', 'return', 'damage', 'stocktake')),
  reference  text,
  note       text,
  created_by text,                        -- Clerk user id
  created_at timestamptz not null default now()
);

create index if not exists inventory_movements_book_idx
  on public.inventory_movements (book_id, created_at desc);

-- ------------------------------------------------------------- promotions
create table if not exists public.promotions (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  title           text not null,
  description     text,
  discount_type   text not null default 'percentage'
                  check (discount_type in ('percentage', 'fixed', 'free_shipping')),
  discount_value  numeric(10, 2) not null default 0 check (discount_value >= 0),
  min_order_total numeric(10, 2) not null default 0 check (min_order_total >= 0),
  usage_limit     integer check (usage_limit is null or usage_limit > 0),
  times_used      integer not null default 0 check (times_used >= 0),
  starts_at       timestamptz,
  ends_at         timestamptz,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint promotions_window check (ends_at is null or starts_at is null or ends_at > starts_at)
);

alter table public.orders
  drop constraint if exists orders_promotion_id_fkey;
alter table public.orders
  add constraint orders_promotion_id_fkey
  foreign key (promotion_id) references public.promotions (id) on delete set null;

-- -------------------------------------------------------------- enquiries
create table if not exists public.enquiries (
  id             uuid primary key default gen_random_uuid(),
  book_id        uuid references public.books (id) on delete set null,
  book_title     text,
  customer_name  text not null,
  phone          text,
  email          text,
  quantity       integer check (quantity is null or quantity > 0),
  message        text,
  source         text not null default 'website'
                 check (source in ('website', 'whatsapp', 'phone', 'walk_in')),
  status         text not null default 'new'
                 check (status in ('new', 'in_progress', 'answered', 'closed')),
  assigned_to    text,                     -- Clerk user id
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists enquiries_status_idx on public.enquiries (status, created_at desc);

-- ------------------------------------------------------- website content
create table if not exists public.content_banners (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subtitle    text,
  image_url   text,
  link_url    text,
  placement   text not null default 'homepage_hero'
              check (placement in ('homepage_hero', 'homepage_strip', 'category', 'promo')),
  sort_order  integer not null default 0,
  active      boolean not null default true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.content_pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  path        text not null,
  description text,
  body        text,
  published   boolean not null default true,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create table if not exists public.featured_sections (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,         -- e.g. featured, bestsellers
  title       text not null,
  subtitle    text,
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.featured_section_books (
  section_id uuid not null references public.featured_sections (id) on delete cascade,
  book_id    uuid not null references public.books (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (section_id, book_id)
);

-- --------------------------------------------------------------- settings
create table if not exists public.store_settings (
  id               boolean primary key default true check (id),
  store_name       text not null default 'Punjab Law Book House',
  store_email      text,
  phone            text,
  whatsapp         text,
  address          text,
  city             text default 'Lahore',
  country          text default 'Pakistan',
  currency         text not null default 'PKR',
  logo_url         text,
  shipping_flat_fee numeric(10, 2) not null default 0 check (shipping_flat_fee >= 0),
  free_shipping_over numeric(10, 2) check (free_shipping_over is null or free_shipping_over >= 0),
  payment_methods  text[] not null default array['cash_on_delivery'],
  meta_title       text,
  meta_description text,
  social           jsonb not null default '{}'::jsonb,
  updated_at       timestamptz not null default now()
);

-- -------------------------------------------------------------- triggers
do $$
declare t text;
begin
  foreach t in array array[
    'admin_members', 'categories', 'books', 'collections', 'customers',
    'orders', 'promotions', 'enquiries', 'content_banners', 'content_pages',
    'featured_sections', 'store_settings'
  ] loop
    execute format('drop trigger if exists %I on public.%I', t || '_touch', t);
    execute format(
      'create trigger %I before update on public.%I
       for each row execute function public.touch_updated_at()', t || '_touch', t);
  end loop;
end $$;

-- Keep books.stock in step with inventory movements.
create or replace function public.apply_inventory_movement()
returns trigger language plpgsql as $$
begin
  update public.books
     set stock = greatest(0, coalesce(stock, 0) + new.delta)
   where id = new.book_id;
  return new;
end;
$$;

drop trigger if exists inventory_movements_apply on public.inventory_movements;
create trigger inventory_movements_apply
  after insert on public.inventory_movements
  for each row execute function public.apply_inventory_movement();
