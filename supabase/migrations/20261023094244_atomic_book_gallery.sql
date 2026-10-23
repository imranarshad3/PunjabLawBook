-- Replace the gallery in one transaction so a failed upload/save cannot erase
-- the existing images. This function keeps the caller's RLS permissions.
create or replace function public.replace_book_images(p_book_id uuid, p_images jsonb)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_images) is distinct from 'array' or jsonb_array_length(p_images) > 20 then
    raise exception 'Choose up to 20 gallery images';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_images) image
    where jsonb_typeof(image) is distinct from 'object'
       or coalesce(image ->> 'url', '') !~ '^(https://|/images/)'
       or char_length(image ->> 'url') > 2048
  ) then
    raise exception 'Every gallery image needs a valid URL';
  end if;
  perform id from public.books where id = p_book_id for update;
  if not found then raise exception 'Book not found'; end if;
  delete from public.book_images where book_id = p_book_id;
  insert into public.book_images(book_id, image_url, alt_text, sort_order)
  select p_book_id, image ->> 'url', left(coalesce(image ->> 'altText', ''), 300), (position - 1)::integer
  from jsonb_array_elements(p_images) with ordinality as images(image, position);
end;
$$;
revoke all on function public.replace_book_images(uuid, jsonb) from public, anon;
grant execute on function public.replace_book_images(uuid, jsonb) to authenticated;
