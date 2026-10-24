-- Least privilege: viewers read; editors maintain catalogue/orders; only owners manage membership.
do $$ declare t text; begin
  foreach t in array array['admin_members','categories','books','collections','collection_books','media_assets','customers','orders','order_items','inventory_movements','promotions','enquiries','content_banners','content_pages','featured_sections','featured_section_books','store_settings','admin_invitations','book_images'] loop
    execute format('drop policy if exists %I on public.%I',t||'_admin_all',t);
    execute format('create policy %I on public.%I for select to authenticated using (public.is_admin())',t||'_staff_read',t);
    if t = 'admin_members' then
      execute format('create policy %I on public.%I for all to authenticated using (public.has_role(array[''owner''])) with check (public.has_role(array[''owner'']))',t||'_staff_write',t);
    elsif t in ('store_settings','admin_invitations') then
      execute format('create policy %I on public.%I for all to authenticated using (public.has_role(array[''owner'',''admin''])) with check (public.has_role(array[''owner'',''admin'']))',t||'_staff_write',t);
    else
      execute format('create policy %I on public.%I for insert to authenticated with check (public.has_role(array[''owner'',''admin'',''editor'']))',t||'_staff_insert',t);
      execute format('create policy %I on public.%I for update to authenticated using (public.has_role(array[''owner'',''admin'',''editor''])) with check (public.has_role(array[''owner'',''admin'',''editor'']))',t||'_staff_update',t);
      if t not in ('orders','order_items','inventory_movements') then
        execute format('create policy %I on public.%I for delete to authenticated using (public.has_role(array[''owner'',''admin'',''editor'']))',t||'_staff_delete',t);
      end if;
    end if;
  end loop;
end $$;
drop policy if exists admin_invitations_staff_read on public.admin_invitations;
create policy admin_invitations_staff_read on public.admin_invitations for select to authenticated using(public.has_role(array['owner','admin']));
drop policy if exists book_reviews_admin_update on public.book_reviews;
create policy book_reviews_admin_update on public.book_reviews for update to authenticated using(public.has_role(array['owner','admin','editor'])) with check(public.has_role(array['owner','admin','editor']));
drop policy if exists book_reviews_admin_delete on public.book_reviews;
create policy book_reviews_admin_delete on public.book_reviews for delete to authenticated using(public.has_role(array['owner','admin','editor']));
drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects for insert to authenticated with check(bucket_id='media' and public.has_role(array['owner','admin','editor']));
drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects for update to authenticated using(bucket_id='media' and public.has_role(array['owner','admin','editor'])) with check(bucket_id='media' and public.has_role(array['owner','admin','editor']));
drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects for delete to authenticated using(bucket_id='media' and public.has_role(array['owner','admin','editor']));

-- Make retries return the same order, even if the first response was lost.
alter table public.orders add column if not exists checkout_request_id uuid unique;
alter table public.orders add column if not exists checkout_fingerprint text;
drop function public.place_order(jsonb,jsonb,text);
create or replace function public.place_order(
  p_customer jsonb,
  p_items jsonb,
  p_clerk_user_id text default null,
  p_request_id uuid default null
)
returns table (order_number text, total numeric)
language plpgsql security definer set search_path = public as $$
declare
  v_identity text := nullif(auth.jwt() ->> 'sub', '');
  v_customer uuid;
  v_order    uuid;
  v_subtotal numeric(10, 2) := 0;
  v_email    text := nullif(trim(coalesce(p_customer ->> 'email', '')), '');
  v_name     text := coalesce(nullif(trim(coalesce(p_customer ->> 'full_name', '')), ''), 'Guest');
  item       jsonb;
  v_book     public.books%rowtype;
  v_qty      integer;
  v_previous public.orders%rowtype;
  v_fingerprint text := encode(sha256(convert_to(jsonb_build_object('customer',p_customer,'items',p_items,'identity',nullif(auth.jwt()->>'sub',''))::text,'UTF8')),'hex');
  v_shipping numeric := 0;
  v_free_over numeric;
  v_promo public.promotions%rowtype;
  v_discount numeric := 0;
begin
  if p_request_id is not null then
    perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 1));
    select * into v_previous from public.orders where checkout_request_id=p_request_id;
    if found then
      if v_previous.checkout_fingerprint is distinct from v_fingerprint then raise exception 'Checkout request was already used with different details'; end if;
      return query select v_previous.order_number, v_previous.total;
      return;
    end if;
  end if;
  if jsonb_typeof(p_customer) is distinct from 'object' then
    raise exception 'Delivery details are required';
  end if;
  if coalesce(trim(p_customer ->> 'full_name'), '') = ''
     or coalesce(trim(p_customer ->> 'phone'), '') = ''
     or coalesce(trim(p_customer ->> 'address'), '') = ''
     or coalesce(trim(p_customer ->> 'city'), '') = '' then
    raise exception 'Name, phone, address and city are required';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'An order needs a list of books';
  end if;
  if jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 100 then
    raise exception 'Choose between 1 and 100 book lines';
  end if;
  if p_clerk_user_id is not null and p_clerk_user_id is distinct from v_identity then
    raise exception 'Order identity does not match the signed-in account';
  end if;
  -- Never attach guest orders to an existing customer using an unverified email.
  if v_identity is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_identity, 0));
    select id into v_customer from public.customers where clerk_user_id = v_identity limit 1;
  end if;

  if v_customer is null then
    insert into public.customers (full_name, email, phone, city, address, clerk_user_id)
    values (v_name, v_email, p_customer ->> 'phone', p_customer ->> 'city',
            p_customer ->> 'address', v_identity)
    returning id into v_customer;
  end if;

  insert into public.orders (
    customer_id, customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, notes, status, payment_method
  ) values (
    v_customer, v_name, v_email, p_customer ->> 'phone',
    p_customer ->> 'address', p_customer ->> 'city', p_customer ->> 'notes',
    'pending', 'cash_on_delivery'
  ) returning id into v_order;

  for item in select value from jsonb_array_elements(p_items) order by (value ->> 'legacy_id')::int loop
    v_qty := (item ->> 'quantity')::int;
    if v_qty is null or v_qty < 1 or v_qty > 100 then
      raise exception 'Quantity must be between 1 and 100';
    end if;
    select * into v_book from public.books
     where legacy_id = (item ->> 'legacy_id')::int and status = 'published' and stock_status <> 'out_of_stock' limit 1 for update;
    if v_book.id is null then
      raise exception 'Book % is not available', item ->> 'legacy_id';
    end if;
    if v_book.stock is not null and v_book.stock < v_qty then
      raise exception 'Not enough stock for %', v_book.title;
    end if;
    insert into public.order_items (order_id, book_id, title, unit_price, quantity)
    values (v_order, v_book.id, v_book.title, v_book.price, v_qty);
    v_subtotal := v_subtotal + (v_book.price * v_qty);
    if v_book.stock is not null then
      insert into public.inventory_movements (book_id, delta, reason, reference)
      values (v_book.id, -v_qty, 'sale', v_order::text);
    end if;
  end loop;

  select coalesce(shipping_flat_fee,0),free_shipping_over into v_shipping,v_free_over from public.store_settings where id=true;
  v_shipping := coalesce(v_shipping,0);
  if v_free_over is not null and v_subtotal >= v_free_over then v_shipping := 0; end if;
  if nullif(trim(p_customer->>'promotion_code'),'') is not null then
    select * into v_promo from public.promotions where lower(code)=lower(trim(p_customer->>'promotion_code')) and active and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now()) order by created_at limit 1 for update;
    if not found then raise exception 'This promotion code is not available'; end if;
    if v_subtotal<v_promo.min_order_total then raise exception 'This order does not meet the promotion minimum'; end if;
    if v_promo.usage_limit is not null and v_promo.times_used>=v_promo.usage_limit then raise exception 'This promotion has reached its usage limit'; end if;
    if v_promo.discount_type='free_shipping' then v_shipping:=0;
    elsif v_promo.discount_type='fixed' then v_discount:=least(v_subtotal,v_promo.discount_value);
    else v_discount:=least(v_subtotal,round(v_subtotal*v_promo.discount_value/100,2)); end if;
    update public.promotions set times_used=times_used+1 where id=v_promo.id;
  end if;
  update public.orders o
     set subtotal = v_subtotal, shipping_fee=v_shipping, discount_total=v_discount, promotion_id=v_promo.id, total = v_subtotal + v_shipping - v_discount, checkout_request_id=p_request_id, checkout_fingerprint=v_fingerprint
   where o.id = v_order;

  return query select o.order_number, o.total from public.orders o where o.id = v_order;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb, text, uuid) from public;
grant execute on function public.place_order(jsonb, jsonb, text, uuid) to anon, authenticated;

-- Terminal order transitions cannot be replayed or reopened to duplicate stock.
create or replace function public.handle_order_transition() returns trigger language plpgsql security definer set search_path=public as $$
declare line record;
begin
  if new.status is not distinct from old.status then return new; end if;
  if not ((old.status='pending' and new.status in ('processing','cancelled'))
       or (old.status='processing' and new.status in ('shipped','cancelled'))
       or (old.status='shipped' and new.status='delivered')
       or (old.status='delivered' and new.status='refunded')) then
    raise exception 'Invalid order status transition: % to %',old.status,new.status;
  end if;
  if new.status='cancelled' then
    for line in select book_id, -sum(delta)::integer as quantity from public.inventory_movements where reference=old.id::text and reason='sale' group by book_id order by book_id loop
      insert into public.inventory_movements(book_id,delta,reason,reference) values(line.book_id,line.quantity,'return',old.id::text);
    end loop;
    if old.promotion_id is not null then update public.promotions set times_used=greatest(0,times_used-1) where id=old.promotion_id; end if;
  end if;
  -- Refunding does not imply returned stock is resellable. Use a return adjustment after inspection.
  return new;
end $$;
revoke all on function public.handle_order_transition() from public,anon,authenticated;
create trigger orders_transition before update of status on public.orders for each row execute function public.handle_order_transition();

-- Reject negative stock instead of silently clamping away a bad adjustment.
create or replace function public.apply_inventory_movement() returns trigger language plpgsql set search_path=public as $$
declare current_stock integer;
begin
 select stock into current_stock from public.books where id=new.book_id for update;
 if current_stock is null then raise exception 'Set a stock count before recording inventory movements'; end if;
 if current_stock+new.delta < 0 then raise exception 'Inventory adjustment would make stock negative'; end if;
 update public.books set stock=current_stock+new.delta where id=new.book_id;
 return new;
end $$;

-- Customers may cancel only their own orders before processing starts.
create or replace function public.cancel_my_order(p_order_id uuid) returns boolean language plpgsql security definer set search_path=public as $$
declare target public.orders%rowtype;
begin
 if nullif(auth.jwt()->>'sub','') is null then raise exception 'Sign in to cancel an order' using errcode='42501'; end if;
 select * into target from public.orders where id=p_order_id and customer_id=public.current_customer_id() for update;
 if not found then raise exception 'Order not found' using errcode='42501'; end if;
 if target.status='cancelled' then return true; end if;
 if target.status<>'pending' then raise exception 'Contact the store to change an order that is already being processed'; end if;
 update public.orders set status='cancelled' where id=target.id;
 return true;
end $$;
revoke all on function public.cancel_my_order(uuid) from public,anon;
grant execute on function public.cancel_my_order(uuid) to authenticated;

-- Public enquiries cannot impersonate an already handled staff record.
drop policy if exists enquiries_public_insert on public.enquiries;
create policy enquiries_public_insert on public.enquiries for insert to anon,authenticated with check(
 status='new' and assigned_to is null and source in ('website','whatsapp')
 and char_length(trim(customer_name)) between 1 and 120
 and (quantity is null or quantity between 1 and 999)
 and char_length(coalesce(book_title,''))<=250 and char_length(coalesce(message,''))<=2500
);

-- These table privileges are never needed by browser/PostgREST callers.
revoke truncate,trigger,references on all tables in schema public from anon,authenticated;
