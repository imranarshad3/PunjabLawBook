-- Row Level Security for every table.
--
-- anon / publishable key  → may read published storefront content only,
--                           plus insert a book enquiry from the website form.
-- Clerk-authenticated admin (row in admin_members) → full access.
--
-- Requires Clerk to be registered as a third-party auth provider in Supabase
-- so that `auth.jwt() ->> 'sub'` carries the Clerk user id.

alter table public.admin_members          enable row level security;
alter table public.categories             enable row level security;
alter table public.books                  enable row level security;
alter table public.collections            enable row level security;
alter table public.collection_books       enable row level security;
alter table public.media_assets           enable row level security;
alter table public.customers              enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.inventory_movements    enable row level security;
alter table public.promotions             enable row level security;
alter table public.enquiries              enable row level security;
alter table public.content_banners        enable row level security;
alter table public.content_pages          enable row level security;
alter table public.featured_sections      enable row level security;
alter table public.featured_section_books enable row level security;
alter table public.store_settings         enable row level security;

-- ------------------------------------------------- public (storefront) read
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (true);

drop policy if exists books_public_read on public.books;
create policy books_public_read on public.books
  for select using (status = 'published' or public.is_admin());

drop policy if exists collections_public_read on public.collections;
create policy collections_public_read on public.collections
  for select using (active or public.is_admin());

drop policy if exists collection_books_public_read on public.collection_books;
create policy collection_books_public_read on public.collection_books
  for select using (true);

drop policy if exists media_public_read on public.media_assets;
create policy media_public_read on public.media_assets
  for select using (true);

drop policy if exists banners_public_read on public.content_banners;
create policy banners_public_read on public.content_banners
  for select using (
    public.is_admin() or (
      active
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at > now())
    )
  );

drop policy if exists pages_public_read on public.content_pages;
create policy pages_public_read on public.content_pages
  for select using (published or public.is_admin());

drop policy if exists sections_public_read on public.featured_sections;
create policy sections_public_read on public.featured_sections
  for select using (active or public.is_admin());

drop policy if exists section_books_public_read on public.featured_section_books;
create policy section_books_public_read on public.featured_section_books
  for select using (true);

drop policy if exists settings_public_read on public.store_settings;
create policy settings_public_read on public.store_settings
  for select using (true);

-- The website "request a book" form may create an enquiry, nothing more.
drop policy if exists enquiries_public_insert on public.enquiries;
create policy enquiries_public_insert on public.enquiries
  for insert with check (true);

-- ---------------------------------------------------------- admin full access
do $$
declare t text;
begin
  foreach t in array array[
    'admin_members', 'categories', 'books', 'collections', 'collection_books',
    'media_assets', 'customers', 'orders', 'order_items', 'inventory_movements',
    'promotions', 'enquiries', 'content_banners', 'content_pages',
    'featured_sections', 'featured_section_books', 'store_settings'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I for all
       using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_all', t);
  end loop;
end $$;

-- Private tables have no public select policy, so the publishable key cannot
-- read customers, orders, order items, inventory movements, promotions,
-- enquiries or team members.
