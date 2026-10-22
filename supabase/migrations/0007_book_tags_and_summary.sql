-- Fields the approved "Add New Book" design asks for that the schema did not
-- carry: a tag list used for discovery, and the short summary shown on cards
-- and in search results (the existing `description` is the long body copy).
-- Idempotent, like every other migration here.

alter table public.books
  add column if not exists tags text[] not null default '{}',
  add column if not exists short_description text not null default '';

comment on column public.books.tags is 'Free-form discovery tags entered in the admin book form.';
comment on column public.books.short_description is 'Card and search-result summary, max 300 characters in the admin form.';

create index if not exists books_tags_idx on public.books using gin (tags);
