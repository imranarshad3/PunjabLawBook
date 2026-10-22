-- Attach a Clerk identity to guest checkout so signed-in readers build an
-- order history instead of a fresh customer row each time.
drop function if exists public.place_order(jsonb, jsonb);

create or replace function public.place_order(
  p_customer jsonb,
  p_items jsonb,
  p_clerk_user_id text default null
)
returns table (order_number text, total numeric)
language plpgsql security definer set search_path = public as $$
declare
  v_customer uuid;
  v_order    uuid;
  v_subtotal numeric(10, 2) := 0;
  v_email    text := nullif(trim(coalesce(p_customer ->> 'email', '')), '');
  v_name     text := coalesce(nullif(trim(coalesce(p_customer ->> 'full_name', '')), ''), 'Guest');
  item       jsonb;
  v_book     public.books%rowtype;
  v_qty      integer;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'An order needs at least one book';
  end if;

  if p_clerk_user_id is not null then
    select id into v_customer from public.customers where clerk_user_id = p_clerk_user_id limit 1;
  end if;

  if v_customer is null and v_email is not null then
    select id into v_customer from public.customers
     where email is not null and lower(email) = lower(v_email) limit 1;
    if v_customer is not null and p_clerk_user_id is not null then
      update public.customers set clerk_user_id = p_clerk_user_id where id = v_customer;
    end if;
  end if;

  if v_customer is null then
    insert into public.customers (full_name, email, phone, city, address, clerk_user_id)
    values (v_name, v_email, p_customer ->> 'phone', p_customer ->> 'city',
            p_customer ->> 'address', p_clerk_user_id)
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

  for item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, coalesce((item ->> 'quantity')::int, 1));
    select * into v_book from public.books
     where legacy_id = (item ->> 'legacy_id')::int and status = 'published' limit 1;
    if v_book.id is null then
      raise exception 'Book % is not available', item ->> 'legacy_id';
    end if;
    insert into public.order_items (order_id, book_id, title, unit_price, quantity)
    values (v_order, v_book.id, v_book.title, v_book.price, v_qty);
    v_subtotal := v_subtotal + (v_book.price * v_qty);
    if v_book.stock is not null then
      insert into public.inventory_movements (book_id, delta, reason, reference)
      values (v_book.id, -v_qty, 'sale', v_order::text);
    end if;
  end loop;

  update public.orders o
     set subtotal = v_subtotal, total = v_subtotal + o.shipping_fee - o.discount_total
   where o.id = v_order;

  return query select o.order_number, o.total from public.orders o where o.id = v_order;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb, text) from public;
grant execute on function public.place_order(jsonb, jsonb, text) to anon, authenticated;
