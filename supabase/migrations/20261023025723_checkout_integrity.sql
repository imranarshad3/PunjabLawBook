-- Emails supplied at guest checkout are unverified and cannot identify an account.
drop index if exists public.customers_email_idx;
create index customers_email_idx on public.customers (lower(email)) where email is not null;

-- Bind order ownership to verified Clerk JWTs; lock stock during checkout.
create or replace function public.place_order(
  p_customer jsonb,
  p_items jsonb,
  p_clerk_user_id text default null
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
begin
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
     where legacy_id = (item ->> 'legacy_id')::int and status = 'published' limit 1 for update;
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

  update public.orders o
     set subtotal = v_subtotal, total = v_subtotal + o.shipping_fee - o.discount_total
   where o.id = v_order;

  return query select o.order_number, o.total from public.orders o where o.id = v_order;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb, text) from public;
grant execute on function public.place_order(jsonb, jsonb, text) to anon, authenticated;
