-- Run as the database owner. All fixture rows and changes are rolled back.
begin;
do $$ begin
  perform set_config('request.jwt.claims', json_build_object('sub',
    (select clerk_user_id from public.admin_members order by created_at limit 1),
    'role', 'authenticated')::text, true);
end $$;
set local role authenticated;
do $$
declare category uuid; book uuid; customer uuid; catalogue_id integer;
begin
  if not public.is_admin() then raise exception 'Admin fixture is unavailable'; end if;
  insert into public.categories(name,slug) values ('QA transaction','qa-' || gen_random_uuid()) returning id into category;
  insert into public.books(title,slug,category_id,price,stock,status,description,tags)
    values ('QA transaction book','qa-' || gen_random_uuid(),category,100.50,5,'published','Keep this description',array['qa'])
    returning id,legacy_id into book,catalogue_id;
  if catalogue_id is null then raise exception 'New books need a storefront catalogue ID'; end if;
  insert into public.customers(full_name,clerk_user_id) values ('QA reader','qa-transaction-reader') returning id into customer;
  perform set_config('app.qa_book',book::text,true);
  perform set_config('app.qa_category',category::text,true);
  perform set_config('app.qa_customer',customer::text,true);
  perform set_config('app.qa_catalogue',catalogue_id::text,true);
  perform public.replace_book_images(book,'[{"url":"/images/book-6078.webp"},{"url":"/images/book-5966.webp"}]');
  if (select count(*) from public.book_images where book_id=book) <> 2 then raise exception 'Gallery replacement failed'; end if;
  begin
    perform public.replace_book_images(book,'[{"url":"invalid"}]');
    raise exception 'Invalid gallery was accepted';
  exception when raise_exception then
    if sqlerrm = 'Invalid gallery was accepted' then raise; end if;
  end;
  if (select count(*) from public.book_images where book_id=book) <> 2 then raise exception 'Invalid gallery erased images'; end if;
  begin
    delete from public.categories where id=category;
    raise exception 'A category containing books was deleted';
  exception when foreign_key_violation then null;
  end;
end $$;
do $$ begin
  perform set_config('request.jwt.claims','{"sub":"qa-transaction-reader","role":"authenticated"}',true);
end $$;
do $$
declare book uuid := current_setting('app.qa_book')::uuid; customer uuid := current_setting('app.qa_customer')::uuid;
begin
  begin
    perform public.replace_book_images(book,'[]');
    raise exception 'A non-admin replaced gallery images';
  exception when insufficient_privilege then null;
  end;
  insert into public.book_reviews(book_id,customer_id,customer_name,rating,title,body)
    values(book,customer,'QA reader',5,'QA review','A transaction-only review for verification.');
  update public.book_reviews set status='published' where book_id=book;
  if found then raise exception 'A reader published their own review'; end if;
end $$;
set local role anon;
do $$ begin
  if exists(select 1 from public.book_reviews where book_id=current_setting('app.qa_book')::uuid) then
    raise exception 'A pending review is public';
  end if;
  perform set_config('request.jwt.claims','{}',true);
  perform * from public.place_order(
    '{"full_name":"QA guest","phone":"0000000000","address":"Transaction only","city":"QA"}',
    jsonb_build_array(jsonb_build_object('legacy_id',current_setting('app.qa_catalogue')::int,'quantity',2)),null);
end $$;
reset role;
do $$
declare book uuid := current_setting('app.qa_book')::uuid; order_count integer;
begin
  if (select stock from public.books where id=book) <> 3 then raise exception 'Checkout stock deduction failed'; end if;
  if not exists(select 1 from public.order_items where book_id=book and quantity=2 and line_total=201) then
    raise exception 'Checkout totals failed';
  end if;
  select count(*) into order_count from public.orders;
  begin
    perform * from public.place_order(
      '{"full_name":"QA guest","phone":"0000000000","address":"Transaction only","city":"QA"}',
      jsonb_build_array(jsonb_build_object('legacy_id',current_setting('app.qa_catalogue')::int,'quantity',100)),null);
    raise exception 'Insufficient stock was accepted';
  exception when raise_exception then
    if sqlerrm not like 'Not enough stock%' then raise; end if;
  end;
  if (select count(*) from public.orders) <> order_count then raise exception 'Failed checkout left an order'; end if;
  update public.book_reviews set status='published' where book_id=book;
end $$;
set local role anon;
do $$ begin
  if (select count(*) from public.book_reviews where book_id=current_setting('app.qa_book')::uuid) <> 1 then
    raise exception 'An approved review is not public';
  end if;
end $$;
reset role;
select 'PASS: admin gallery replacement, failed-save preservation, customer moderation isolation, public review visibility, category protection, checkout totals and stock rollback' as result;
rollback;
