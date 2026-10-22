-- `legacy_id` is the numeric id the storefront routes on (/products/<legacy_id>)
-- and the client mapper falls back to 0 when it is null, which collapses every
-- new book onto the same id and leaves it without a product URL. Books added
-- through the admin had no way to get one, so give the column a sequence that
-- starts above the ids already imported.
do $$
declare next_id bigint;
begin
  if not exists (select 1 from pg_class where relname = 'books_legacy_id_seq') then
    select coalesce(max(legacy_id), 0) + 1 into next_id from public.books;
    execute format('create sequence public.books_legacy_id_seq start with %s owned by public.books.legacy_id', next_id);
  end if;
end $$;

alter table public.books
  alter column legacy_id set default nextval('public.books_legacy_id_seq');

update public.books set legacy_id = nextval('public.books_legacy_id_seq') where legacy_id is null;

alter table public.books alter column legacy_id set not null;
