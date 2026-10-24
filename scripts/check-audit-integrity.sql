-- Isolated local database only. All fixtures are rolled back.
begin;
insert into public.admin_members(clerk_user_id,role) values('qa-owner','owner'),('qa-viewer','viewer'),('qa-editor','editor');
insert into public.store_settings(id,store_name,shipping_flat_fee,free_shipping_over) values(true,'QA store',100,500) on conflict(id) do update set shipping_flat_fee=100,free_shipping_over=500;
insert into public.books(title,slug,price,stock,status) values('QA integrity','qa-integrity',100.50,5,'published');
select set_config('app.qa_book',(select id::text from books where slug='qa-integrity'),true);
select set_config('app.qa_legacy',(select legacy_id::text from books where slug='qa-integrity'),true);
select set_config('request.jwt.claims','{"sub":"qa-viewer","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
  update public.books set price=1 where id=current_setting('app.qa_book')::uuid;
  if found then raise exception 'Viewer changed price'; end if;
  update public.admin_members set role='owner' where clerk_user_id='qa-viewer';
  if found then raise exception 'Viewer escalated role'; end if;
  update public.store_settings set store_name='bad' where id=true;
  if found then raise exception 'Viewer changed settings'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"qa-editor","role":"authenticated"}',true);
do $$ begin
 update public.books set price=100.50 where id=current_setting('app.qa_book')::uuid;
 if not found then raise exception 'Editor cannot edit book'; end if;
 update public.admin_members set role='owner' where clerk_user_id='qa-editor';
 if found then raise exception 'Editor escalated role'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{}',true);
set local role anon;
do $$ declare result record; retry record; begin
 select * into result from public.place_order('{"full_name":"QA reader","phone":"0000000000","address":"Test only","city":"QA"}',jsonb_build_array(jsonb_build_object('legacy_id',current_setting('app.qa_legacy')::int,'quantity',2)),null,'11111111-1111-4111-8111-111111111111');
 if result.total <> 301 then raise exception 'Shipping or totals wrong: %',result.total; end if;
 select * into retry from public.place_order('{"full_name":"QA reader","phone":"0000000000","address":"Test only","city":"QA"}',jsonb_build_array(jsonb_build_object('legacy_id',current_setting('app.qa_legacy')::int,'quantity',2)),null,'11111111-1111-4111-8111-111111111111');
 if result.order_number <> retry.order_number then raise exception 'Duplicate order on retry'; end if;
 begin
  perform * from public.place_order('{"full_name":"different","phone":"0","address":"x","city":"QA"}',jsonb_build_array(jsonb_build_object('legacy_id',current_setting('app.qa_legacy')::int,'quantity',1)),null,'11111111-1111-4111-8111-111111111111');
  raise exception 'Changed payload accepted';
 exception when raise_exception then if sqlerrm='Changed payload accepted' then raise; end if; end;
end $$;
reset role;
do $$ declare order_id uuid; begin
 if (select stock from books where id=current_setting('app.qa_book')::uuid) <> 3 then raise exception 'Stock deducted more than once'; end if;
 select id into order_id from orders where checkout_request_id='11111111-1111-4111-8111-111111111111';
 update orders set status='cancelled' where id=order_id;
 update orders set status='cancelled' where id=order_id;
 if (select stock from books where id=current_setting('app.qa_book')::uuid) <> 5 then raise exception 'Cancel stock not restored exactly once'; end if;
 begin
  update orders set status='processing' where id=order_id;
  raise exception 'Cancelled order reopened';
 exception when raise_exception then if sqlerrm='Cancelled order reopened' then raise; end if; end;
end $$;
select 'PASS: viewer/editor isolation, shipping, retry idempotency, payload binding, exact-once cancellation restock, terminal transition guards' as result;
reset role;
insert into public.promotions(code,title,discount_type,discount_value,min_order_total,usage_limit) values('QA10','QA campaign','percentage',10,0,1);
set local role anon;
do $$ declare placed record; begin
 select * into placed from public.place_order('{"full_name":"QA discount","phone":"0","address":"Test","city":"QA","promotion_code":"qa10"}',jsonb_build_array(jsonb_build_object('legacy_id',current_setting('app.qa_legacy')::int,'quantity',1)),null,'33333333-3333-4333-8333-333333333333');
 if placed.total<>190.45 then raise exception 'Promotion total incorrect: %',placed.total; end if;
 begin
  perform * from public.place_order('{"full_name":"QA discount","phone":"0","address":"Test","city":"QA","promotion_code":"QA10"}',jsonb_build_array(jsonb_build_object('legacy_id',current_setting('app.qa_legacy')::int,'quantity',1)),null,'44444444-4444-4444-8444-444444444444');
  raise exception 'Promotion usage exceeded';
 exception when raise_exception then if sqlerrm='Promotion usage exceeded' then raise; end if; end;
end $$;
reset role;
do $$ begin
 if (select stock from books where id=current_setting('app.qa_book')::uuid)<>4 then raise exception 'Rejected promotion changed stock'; end if;
 update orders set status='cancelled' where checkout_request_id='33333333-3333-4333-8333-333333333333';
 if (select times_used from promotions where code='QA10')<>0 then raise exception 'Cancelled promotion usage not released'; end if;
end $$;
select 'PASS: case-insensitive promotion, rounded discount, usage limit, failed promotion rollback and cancellation release' as result;
set local role anon;
do $$ declare placed record; begin
 select * into placed from public.place_order('{"full_name":"QA free delivery","phone":"0","address":"Test","city":"QA"}',jsonb_build_array(jsonb_build_object('legacy_id',current_setting('app.qa_legacy')::int,'quantity',5)),null,'55555555-5555-4555-8555-555555555555');
 if placed.total<>502.50 then raise exception 'Free delivery threshold failed'; end if;
end $$;
reset role;
do $$ begin
 update orders set status='cancelled' where checkout_request_id='55555555-5555-4555-8555-555555555555';
 begin
  insert into inventory_movements(book_id,delta,reason) values(current_setting('app.qa_book')::uuid,-99,'adjustment');
  raise exception 'Negative inventory accepted';
 exception when raise_exception then if sqlerrm='Negative inventory accepted' then raise; end if; end;
 if (select stock from books where id=current_setting('app.qa_book')::uuid)<>5 then raise exception 'Bad adjustment changed stock'; end if;
end $$;
select 'PASS: free shipping threshold and negative inventory rollback' as result;
select set_config('request.jwt.claims','{"sub":"qa-order-reader","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
 perform * from public.place_order('{"full_name":"QA owner","phone":"0","address":"Test","city":"QA"}',jsonb_build_array(jsonb_build_object('legacy_id',current_setting('app.qa_legacy')::int,'quantity',1)),null,'66666666-6666-4666-8666-666666666666');
end $$;
reset role;
select set_config('app.qa_order',(select id::text from orders where checkout_request_id='66666666-6666-4666-8666-666666666666'),true);
select set_config('request.jwt.claims','{"sub":"another-reader","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
 begin
  perform public.cancel_my_order(current_setting('app.qa_order')::uuid);
  raise exception 'Customer cancelled another customer order';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"qa-order-reader","role":"authenticated"}',true);
do $$ begin perform public.cancel_my_order(current_setting('app.qa_order')::uuid); perform public.cancel_my_order(current_setting('app.qa_order')::uuid); end $$;
reset role;
do $$ begin if (select stock from books where id=current_setting('app.qa_book')::uuid)<>5 then raise exception 'Own cancellation did not restore stock once'; end if; end $$;
select 'PASS: customer cancellation ownership and idempotent stock restoration' as result;
set local role anon;
do $$ begin
 insert into enquiries(customer_name,message) values('QA enquiry','Valid local test');
 begin
  insert into enquiries(customer_name,status) values('Spoofed handler','answered');
  raise exception 'Public handled enquiry accepted';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: public enquiry validation and staff-state isolation' as result;
select set_config('request.jwt.claims','{"sub":"qa-editor","role":"authenticated"}',true);
set local role authenticated;
insert into content_pages(title,slug,path,body,published) values('QA page','qa-page','/qa-audit','Draft body',false);
select set_config('request.jwt.claims','{}',true);
set local role anon;
do $$ begin if exists(select 1 from content_pages where path='/qa-audit') then raise exception 'Draft content visible publicly'; end if; end $$;
select set_config('request.jwt.claims','{"sub":"qa-editor","role":"authenticated"}',true);
set local role authenticated;
update content_pages set body='Published body',published=true where path='/qa-audit';
select set_config('request.jwt.claims','{}',true);
set local role anon;
do $$ begin if not exists(select 1 from content_pages where path='/qa-audit' and body='Published body') then raise exception 'Published content not visible'; end if; end $$;
reset role;
select 'PASS: editor CMS editing, draft isolation and published content visibility' as result;
-- Existing gallery/review/category regressions run in the same rollback transaction.
-- Run as the database owner. All fixture rows and changes are rolled back.
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
