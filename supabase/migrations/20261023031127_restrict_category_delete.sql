-- Keep category deletion from orphaning or silently reclassifying books.
alter table public.books
  drop constraint if exists books_category_id_fkey;

alter table public.books
  add constraint books_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete restrict;
