create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Agroline user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'Agroline user'
  )
from auth.users u
on conflict (id) do nothing;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  crop_name text not null check (length(trim(crop_name)) between 1 and 160),
  variety text not null default '',
  category text not null check (category in ('grains', 'legumes', 'tubers', 'oilseeds', 'inputs')),
  lot_number text not null check (length(trim(lot_number)) between 1 and 100),
  quantity_tonnes numeric(12, 3) not null check (quantity_tonnes >= 0),
  price_per_tonne numeric(12, 2) not null check (price_per_tonne > 0),
  minimum_order_tonnes numeric(12, 3) not null default 1 check (minimum_order_tonnes > 0),
  moisture_content numeric(5, 2) not null default 0 check (moisture_content between 0 and 100),
  grade text not null default 'Grade 1 (Premium)',
  status text not null default 'Available' check (status in ('Available', 'Reserved', 'In Transit', 'Sold Out')),
  warehouse_location text not null default '',
  harvest_date date not null default current_date,
  image_url text not null default '',
  description text not null default '',
  packaging text not null default '',
  certifications text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, lot_number)
);

create trigger inventory_set_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

create index inventory_marketplace_idx
  on public.inventory (category, created_at desc)
  where status = 'Available' and quantity_tonnes > 0;
create index inventory_seller_idx on public.inventory (seller_id, created_at desc);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  inventory_id uuid references public.inventory (id) on delete set null,
  subject text not null default '',
  created_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);

create unique index conversations_without_listing_unique
  on public.conversations (buyer_id, seller_id)
  where inventory_id is null;
create unique index conversations_with_listing_unique
  on public.conversations (buyer_id, seller_id, inventory_id)
  where inventory_id is not null;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (length(trim(content)) between 1 and 10000),
  proposal jsonb,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id),
  seller_id uuid not null references public.profiles (id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'fulfilled')),
  buyer_organization text not null check (length(trim(buyer_organization)) between 1 and 200),
  delivery_address text not null check (length(trim(delivery_address)) between 1 and 500),
  subtotal numeric(14, 2) not null default 0 check (subtotal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create index orders_buyer_idx on public.orders (buyer_id, created_at desc);
create index orders_seller_idx on public.orders (seller_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  inventory_id uuid references public.inventory (id) on delete set null,
  crop_name text not null,
  variety text not null default '',
  quantity_tonnes numeric(12, 3) not null check (quantity_tonnes > 0),
  price_per_tonne numeric(12, 2) not null check (price_per_tonne > 0),
  line_total numeric(14, 2) generated always as (quantity_tonnes * price_per_tonne) stored
);

create index order_items_order_idx on public.order_items (order_id);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  tracking_number text not null unique check (length(trim(tracking_number)) between 1 and 100),
  carrier text not null default '',
  origin text not null default '',
  destination text not null default '',
  status text not null default 'Label created',
  estimated_arrival date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger shipments_set_updated_at
  before update on public.shipments
  for each row execute function public.set_updated_at();

create table public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  location text not null default '',
  status text not null check (length(trim(status)) between 1 and 160),
  notes text not null default '',
  occurred_at timestamptz not null default now()
);

create index shipment_events_timeline_idx on public.shipment_events (shipment_id, occurred_at);

alter table public.profiles enable row level security;
alter table public.inventory enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;

create policy "Profiles are visible to marketplace users"
  on public.profiles for select
  using (true);
create policy "Users manage their own profile"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Available inventory is public"
  on public.inventory for select
  using (
    (status = 'Available' and quantity_tonnes > 0)
    or seller_id = (select auth.uid())
  );
create policy "Authenticated users create their own inventory"
  on public.inventory for insert
  to authenticated
  with check (seller_id = (select auth.uid()));
create policy "Sellers update their own inventory"
  on public.inventory for update
  to authenticated
  using (seller_id = (select auth.uid()))
  with check (seller_id = (select auth.uid()));
create policy "Sellers delete their own inventory"
  on public.inventory for delete
  to authenticated
  using (seller_id = (select auth.uid()));

create policy "Conversation participants can view conversations"
  on public.conversations for select
  to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));
create policy "Buyers can start conversations"
  on public.conversations for insert
  to authenticated
  with check (
    buyer_id = (select auth.uid())
    and seller_id <> (select auth.uid())
    and (inventory_id is null or exists (
      select 1
      from public.inventory i
      where i.id = inventory_id and i.seller_id = seller_id
    ))
  );

create policy "Conversation participants can read messages"
  on public.messages for select
  to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (select auth.uid()) in (c.buyer_id, c.seller_id)
  ));
create policy "Participants can send messages as themselves"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (select auth.uid()) in (c.buyer_id, c.seller_id)
    )
  );

create policy "Order participants can view orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));
create policy "Order participants can view line items"
  on public.order_items for select
  to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (select auth.uid()) in (o.buyer_id, o.seller_id)
  ));

create policy "Order participants can view shipments"
  on public.shipments for select
  to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (select auth.uid()) in (o.buyer_id, o.seller_id)
  ));
create policy "Sellers manage shipment records"
  on public.shipments for all
  to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and o.seller_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and o.seller_id = (select auth.uid())
  ));

create policy "Order participants can view shipment events"
  on public.shipment_events for select
  to authenticated
  using (exists (
    select 1
    from public.shipments s
    join public.orders o on o.id = s.order_id
    where s.id = shipment_id
      and (select auth.uid()) in (o.buyer_id, o.seller_id)
  ));
create policy "Sellers add shipment events"
  on public.shipment_events for insert
  to authenticated
  with check (exists (
    select 1
    from public.shipments s
    join public.orders o on o.id = s.order_id
    where s.id = shipment_id and o.seller_id = (select auth.uid())
  ));

create function public.open_trade_conversation(
  p_buyer_id uuid,
  p_seller_id uuid,
  p_inventory_id uuid,
  p_subject text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation_id uuid;
begin
  if auth.uid() is null or auth.uid() <> p_buyer_id then
    raise exception 'Sign in as the conversation participant.';
  end if;
  if p_seller_id = p_buyer_id then
    raise exception 'You cannot start a conversation with yourself.';
  end if;
  if p_inventory_id is not null and not exists (
    select 1 from public.inventory
    where id = p_inventory_id and seller_id = p_seller_id
  ) then
    raise exception 'The selected listing does not belong to this seller.';
  end if;

  if p_inventory_id is null then
    insert into public.conversations (buyer_id, seller_id, inventory_id, subject)
    values (p_buyer_id, p_seller_id, null, left(trim(coalesce(p_subject, '')), 200))
    on conflict (buyer_id, seller_id) where inventory_id is null
    do update set subject = excluded.subject
    returning id into v_conversation_id;
  else
    insert into public.conversations (buyer_id, seller_id, inventory_id, subject)
    values (p_buyer_id, p_seller_id, p_inventory_id, left(trim(coalesce(p_subject, '')), 200))
    on conflict (buyer_id, seller_id, inventory_id) where inventory_id is not null
    do update set subject = excluded.subject
    returning id into v_conversation_id;
  end if;
  return v_conversation_id;
end;
$$;

create function public.create_order_shipment(
  p_order_id uuid,
  p_tracking_number text,
  p_carrier text,
  p_origin text,
  p_destination text,
  p_estimated_arrival date,
  p_status text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shipment_id uuid;
begin
  if auth.uid() is null or not exists (
    select 1 from public.orders
    where id = p_order_id and seller_id = auth.uid() and status = 'accepted'
  ) then
    raise exception 'Only the seller of an accepted order can create its shipment.';
  end if;

  insert into public.shipments (
    order_id, tracking_number, carrier, origin, destination, estimated_arrival, status
  )
  values (
    p_order_id, trim(p_tracking_number), coalesce(p_carrier, ''), coalesce(p_origin, ''),
    coalesce(p_destination, ''), p_estimated_arrival, trim(p_status)
  )
  returning id into v_shipment_id;

  insert into public.shipment_events (shipment_id, location, status)
  values (v_shipment_id, coalesce(p_origin, ''), trim(p_status));
  return v_shipment_id;
end;
$$;

create function public.append_shipment_event(
  p_shipment_id uuid,
  p_status text,
  p_location text,
  p_notes text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.shipments s
    join public.orders o on o.id = s.order_id
    where s.id = p_shipment_id and o.seller_id = auth.uid()
  ) then
    raise exception 'Only the seller can update this shipment.';
  end if;
  update public.shipments
  set status = trim(p_status)
  where id = p_shipment_id;
  if not found then
    raise exception 'Shipment not found.';
  end if;
  insert into public.shipment_events (shipment_id, status, location, notes)
  values (p_shipment_id, trim(p_status), coalesce(p_location, ''), coalesce(p_notes, ''));
end;
$$;

create function public.create_trade_order(
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

    if not found or v_listing.status <> 'Available' then
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

create function public.update_trade_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in to update an order.';
  end if;
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;
  if not found then
    raise exception 'Order not found.';
  end if;
  if p_status = 'accepted' and v_order.status = 'pending' and v_order.seller_id = auth.uid() then
    update public.orders set status = p_status where id = p_order_id;
  elsif p_status = 'rejected' and v_order.status = 'pending' and v_order.seller_id = auth.uid() then
    update public.orders set status = p_status where id = p_order_id;
    update public.inventory i
    set quantity_tonnes = i.quantity_tonnes + item_totals.quantity,
        status = 'Available'
    from (
      select inventory_id, sum(quantity_tonnes) as quantity
      from public.order_items
      where order_id = p_order_id and inventory_id is not null
      group by inventory_id
    ) item_totals
    where i.id = item_totals.inventory_id and i.seller_id = auth.uid();
  elsif p_status = 'cancelled' and v_order.status = 'pending' and v_order.buyer_id = auth.uid() then
    update public.orders set status = p_status where id = p_order_id;
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
  elsif p_status = 'fulfilled' and v_order.seller_id = auth.uid() and v_order.status = 'accepted' then
    update public.orders set status = p_status where id = p_order_id;
  else
    raise exception 'You are not allowed to perform this order status change.';
  end if;
end;
$$;

revoke all on function public.create_trade_order(jsonb, text, text) from public;
revoke all on function public.update_trade_order_status(uuid, text) from public;
revoke all on function public.open_trade_conversation(uuid, uuid, uuid, text) from public;
revoke all on function public.create_order_shipment(uuid, text, text, text, text, date, text) from public;
revoke all on function public.append_shipment_event(uuid, text, text, text) from public;
grant execute on function public.create_trade_order(jsonb, text, text) to authenticated;
grant execute on function public.update_trade_order_status(uuid, text) to authenticated;
grant execute on function public.open_trade_conversation(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.create_order_shipment(uuid, text, text, text, text, date, text) to authenticated;
grant execute on function public.append_shipment_event(uuid, text, text, text) to authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.inventory to anon, authenticated;
grant insert, update, delete on public.inventory to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert on public.conversations, public.messages to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant select, insert, update, delete on public.shipments to authenticated;
grant select, insert on public.shipment_events to authenticated;
