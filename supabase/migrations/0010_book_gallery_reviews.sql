-- Book galleries and moderated reader reviews.
create table if not exists public.book_images (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists book_images_book_order_idx
  on public.book_images (book_id, sort_order, created_at);

create table if not exists public.book_reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  customer_name text not null,
  rating smallint not null check (rating between 1 and 5),
  title text not null,
  body text not null,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, customer_id)
);

create index if not exists book_reviews_public_idx
  on public.book_reviews (book_id, status, created_at desc);
create index if not exists book_reviews_customer_idx
  on public.book_reviews (customer_id, created_at desc);

-- Give the existing law subjects a useful default icon while leaving custom
-- selections untouched.
update public.categories
set icon = case
  when lower(name) like '%criminal%' or lower(name) like '%family%' then 'scale'
  when lower(name) like '%evidence%' then 'gavel'
  when lower(name) like '%tax%' then 'scroll'
  when lower(name) like '%exam%' or lower(name) like '%student%' then 'graduation'
  else 'book'
end
where coalesce(icon, 'book') = 'book';

alter table public.book_images enable row level security;
alter table public.book_reviews enable row level security;

-- PostgREST needs SQL privileges as well as an RLS policy. Keep anonymous
-- access read-only for published gallery/review data; Clerk-authenticated
-- admins are narrowed by the policies below.
grant select on public.book_images to anon, authenticated;
grant insert, update, delete on public.book_images to authenticated;
grant select, insert, update, delete on public.book_reviews to authenticated;
grant select on public.book_reviews to anon;

drop policy if exists book_images_public_read on public.book_images;
create policy book_images_public_read on public.book_images
  for select using (true);
drop policy if exists book_images_admin_all on public.book_images;
create policy book_images_admin_all on public.book_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists book_reviews_public_read on public.book_reviews;
create policy book_reviews_public_read on public.book_reviews
  for select using (status = 'published' or public.is_admin());
drop policy if exists book_reviews_customer_insert on public.book_reviews;
create policy book_reviews_customer_insert on public.book_reviews
  for insert with check (
    customer_id = public.current_customer_id()
    and status = 'pending'
    and char_length(trim(customer_name)) between 1 and 120
    and char_length(trim(title)) between 1 and 160
    and char_length(trim(body)) between 10 and 5000
  );
drop policy if exists book_reviews_admin_update on public.book_reviews;
create policy book_reviews_admin_update on public.book_reviews
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists book_reviews_admin_delete on public.book_reviews;
create policy book_reviews_admin_delete on public.book_reviews
  for delete using (public.is_admin());
