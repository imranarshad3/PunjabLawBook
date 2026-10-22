-- A signed-in reader may read their own customer record, orders and lines.
create or replace function public.current_customer_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.customers
   where clerk_user_id is not null
     and clerk_user_id = coalesce(auth.jwt() ->> 'sub', '')
   limit 1
$$;

drop policy if exists customers_self_read on public.customers;
create policy customers_self_read on public.customers
  for select using (
    clerk_user_id is not null and clerk_user_id = coalesce(auth.jwt() ->> 'sub', '')
  );

drop policy if exists orders_self_read on public.orders;
create policy orders_self_read on public.orders
  for select using (customer_id = public.current_customer_id());

drop policy if exists order_items_self_read on public.order_items;
create policy order_items_self_read on public.order_items
  for select using (
    order_id in (select id from public.orders where customer_id = public.current_customer_id())
  );
