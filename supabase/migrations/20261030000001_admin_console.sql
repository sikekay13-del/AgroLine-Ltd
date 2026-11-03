create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;
revoke all on public.user_roles from public, anon, authenticated;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles r
    where r.user_id = (select auth.uid())
      and r.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Admins can moderate listings"
  on public.inventory for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke update on public.inventory from authenticated;
revoke insert on public.inventory from authenticated;
grant insert (
  seller_id,
  crop_name,
  variety,
  category,
  lot_number,
  quantity_tonnes,
  price_per_tonne,
  minimum_order_tonnes,
  moisture_content,
  grade,
  status,
  warehouse_location,
  harvest_date,
  image_url,
  description,
  packaging,
  certifications
) on public.inventory to authenticated;
grant update (
  crop_name,
  variety,
  category,
  lot_number,
  quantity_tonnes,
  price_per_tonne,
  minimum_order_tonnes,
  moisture_content,
  grade,
  status,
  warehouse_location,
  harvest_date,
  image_url,
  description,
  packaging,
  certifications
) on public.inventory to authenticated;

alter table public.inventory
  add column is_listed boolean not null default true,
  add column moderation_note text not null default '';

drop policy "Available inventory is public" on public.inventory;
create policy "Listed inventory is public"
  on public.inventory for select
  using (
    (is_listed and status = 'Available' and quantity_tonnes > 0)
    or seller_id = (select auth.uid())
  );

create or replace function public.create_trade_order(
  p_items jsonb,
  p_buyer_organization text,
  p_delivery_address text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_buyer_id uuid := auth.uid();
  v_seller_id uuid;
  v_order_id uuid;
  v_item jsonb;
  v_listing public.inventory%rowtype;
  v_quantity numeric(12, 3);
  v_subtotal numeric(14, 2) := 0;
  v_item_count integer := 0;
  v_duplicate_count integer;
begin
  if v_buyer_id is null then
    raise exception 'Sign in before placing an order.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one listing.';
  end if;
  if length(trim(p_buyer_organization)) not between 1 and 200
    or length(trim(p_delivery_address)) not between 1 and 500 then
    raise exception 'Buyer organization and delivery address are required.';
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
    order by value ->> 'inventory_id'
  loop
    v_item_count := v_item_count + 1;
    if v_item_count > 50 then
      raise exception 'An order may contain at most 50 listings.';
    end if;
    if not (v_item ? 'inventory_id') or not (v_item ? 'quantity_tonnes') then
      raise exception 'Each order item must include a listing and quantity.';
    end if;

    v_quantity := (v_item ->> 'quantity_tonnes')::numeric;
    if v_quantity <= 0 then
      raise exception 'Order quantities must be greater than zero.';
    end if;

    select * into v_listing
    from public.inventory
    where id = (v_item ->> 'inventory_id')::uuid
    for update;

    if not found or v_listing.status <> 'Available' or not v_listing.is_listed then
      raise exception 'A selected listing is no longer available.';
    end if;
    if v_listing.seller_id = v_buyer_id then
      raise exception 'You cannot place an order for your own listing.';
    end if;
    if v_quantity < v_listing.minimum_order_tonnes
      or v_quantity > v_listing.quantity_tonnes then
      raise exception 'An order quantity is outside the listing limits.';
    end if;
    if v_seller_id is not null and v_seller_id <> v_listing.seller_id then
      raise exception 'Create separate orders for listings from different sellers.';
    end if;
    select count(*) into v_duplicate_count
    from jsonb_array_elements(p_items) duplicate_item
    where duplicate_item ->> 'inventory_id' = v_item ->> 'inventory_id';
    if v_duplicate_count > 1 then
      raise exception 'Each listing may appear only once in an order.';
    end if;

    v_seller_id := v_listing.seller_id;
    v_subtotal := v_subtotal + (v_quantity * v_listing.price_per_tonne);
  end loop;

  insert into public.orders (
    buyer_id, seller_id, buyer_organization, delivery_address, subtotal
  )
  values (
    v_buyer_id, v_seller_id, trim(p_buyer_organization), trim(p_delivery_address), v_subtotal
  )
  returning id into v_order_id;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
    order by value ->> 'inventory_id'
  loop
    v_quantity := (v_item ->> 'quantity_tonnes')::numeric;
    select * into v_listing
    from public.inventory
    where id = (v_item ->> 'inventory_id')::uuid
    for update;

    insert into public.order_items (
      order_id, inventory_id, crop_name, variety, quantity_tonnes, price_per_tonne
    )
    values (
      v_order_id, v_listing.id, v_listing.crop_name, v_listing.variety,
      v_quantity, v_listing.price_per_tonne
    );

    update public.inventory
    set quantity_tonnes = quantity_tonnes - v_quantity,
        status = case when quantity_tonnes - v_quantity = 0 then 'Sold Out' else status end
    where id = v_listing.id;
  end loop;

  return v_order_id;
end;
$$;

create function public.admin_dashboard_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  return jsonb_build_object(
    'users', (select count(*) from auth.users),
    'listings', (select count(*) from public.inventory),
    'unlisted', (select count(*) from public.inventory where not is_listed),
    'orders', (select count(*) from public.orders),
    'pending_orders', (select count(*) from public.orders where status = 'pending')
  );
end;
$$;

create function public.admin_list_users()
returns table (
  id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  inventory_count bigint,
  order_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  return query
  select
    u.id,
    u.email::text,
    p.display_name,
    u.created_at,
    (select count(*) from public.inventory i where i.seller_id = u.id),
    (select count(*) from public.orders o where o.buyer_id = u.id or o.seller_id = u.id)
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc
  limit 500;
end;
$$;

create function public.admin_list_inventory()
returns table (
  id uuid,
  seller_id uuid,
  seller_email text,
  seller_name text,
  crop_name text,
  variety text,
  category text,
  lot_number text,
  quantity_tonnes numeric,
  price_per_tonne numeric,
  status text,
  is_listed boolean,
  moderation_note text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  return query
  select
    i.id,
    i.seller_id,
    u.email::text,
    p.display_name,
    i.crop_name,
    i.variety,
    i.category,
    i.lot_number,
    i.quantity_tonnes,
    i.price_per_tonne,
    i.status,
    i.is_listed,
    i.moderation_note,
    i.created_at
  from public.inventory i
  join auth.users u on u.id = i.seller_id
  left join public.profiles p on p.id = i.seller_id
  order by i.created_at desc
  limit 1000;
end;
$$;

create function public.admin_set_listing_visibility(
  p_inventory_id uuid,
  p_is_listed boolean,
  p_moderation_note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;
  update public.inventory
  set is_listed = p_is_listed,
      moderation_note = left(trim(coalesce(p_moderation_note, '')), 1000)
  where id = p_inventory_id;
  if not found then
    raise exception 'Listing not found.';
  end if;
end;
$$;

create function public.admin_list_orders()
returns table (
  id uuid,
  buyer_id uuid,
  buyer_email text,
  seller_id uuid,
  seller_email text,
  status text,
  buyer_organization text,
  delivery_address text,
  subtotal numeric,
  created_at timestamptz,
  items jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  return query
  select
    o.id,
    o.buyer_id,
    buyer.email::text,
    o.seller_id,
    seller.email::text,
    o.status,
    o.buyer_organization,
    o.delivery_address,
    o.subtotal,
    o.created_at,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'crop_name', oi.crop_name,
        'quantity_tonnes', oi.quantity_tonnes,
        'price_per_tonne', oi.price_per_tonne,
        'line_total', oi.line_total
      ))
      from public.order_items oi
      where oi.order_id = o.id
    ), '[]'::jsonb)
  from public.orders o
  join auth.users buyer on buyer.id = o.buyer_id
  join auth.users seller on seller.id = o.seller_id
  order by o.created_at desc
  limit 1000;
end;
$$;

create function public.admin_update_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;
  if not found then
    raise exception 'Order not found.';
  end if;

  if p_status in ('accepted', 'rejected', 'cancelled')
    and v_order.status = 'pending' then
    update public.orders set status = p_status where id = p_order_id;
    if p_status in ('rejected', 'cancelled') then
      update public.inventory i
      set quantity_tonnes = i.quantity_tonnes + item_totals.quantity,
          status = 'Available'
      from (
        select inventory_id, sum(quantity_tonnes) as quantity
        from public.order_items
        where order_id = p_order_id and inventory_id is not null
        group by inventory_id
      ) item_totals
      where i.id = item_totals.inventory_id and i.seller_id = v_order.seller_id;
    end if;
  elsif p_status = 'fulfilled' and v_order.status = 'accepted' then
    update public.orders set status = p_status where id = p_order_id;
  else
    raise exception 'This order status transition is not allowed.';
  end if;
end;
$$;

revoke all on function public.admin_dashboard_summary() from public;
revoke all on function public.admin_list_users() from public;
revoke all on function public.admin_list_inventory() from public;
revoke all on function public.admin_set_listing_visibility(uuid, boolean, text) from public;
revoke all on function public.admin_list_orders() from public;
revoke all on function public.admin_update_order_status(uuid, text) from public;
grant execute on function public.admin_dashboard_summary() to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_list_inventory() to authenticated;
grant execute on function public.admin_set_listing_visibility(uuid, boolean, text) to authenticated;
grant execute on function public.admin_list_orders() to authenticated;
grant execute on function public.admin_update_order_status(uuid, text) to authenticated;
