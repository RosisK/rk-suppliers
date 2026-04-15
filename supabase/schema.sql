create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12, 2) not null default 0,
  min_order integer,
  category text,
  stock integer,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists products_set_updated_at on public.products;
drop trigger if exists orders_set_updated_at on public.orders;

alter table public.products add column if not exists image_path text;
alter table public.products add column if not exists created_at timestamptz;
alter table public.products add column if not exists updated_at timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'image'
  ) then
    execute '
      update public.products
      set image_path = image
      where image_path is null and image is not null
    ';
  end if;
end
$$;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text not null,
  items jsonb not null,
  total numeric(12, 2) not null default 0,
  payment_method text not null,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.contacts add column if not exists created_at timestamptz;
alter table public.orders add column if not exists created_at timestamptz;
alter table public.orders add column if not exists updated_at timestamptz;
alter table public.admin_users add column if not exists created_at timestamptz;

update public.products
set
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

update public.contacts
set created_at = coalesce(created_at, now());

update public.orders
set
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

update public.admin_users
set created_at = coalesce(created_at, now());

alter table public.products alter column created_at set default now();
alter table public.products alter column created_at set not null;
alter table public.products alter column updated_at set default now();
alter table public.products alter column updated_at set not null;

alter table public.contacts alter column created_at set default now();
alter table public.contacts alter column created_at set not null;

alter table public.orders alter column created_at set default now();
alter table public.orders alter column created_at set not null;
alter table public.orders alter column updated_at set default now();
alter table public.orders alter column updated_at set not null;

alter table public.admin_users alter column created_at set default now();
alter table public.admin_users alter column created_at set not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.contacts enable row level security;
alter table public.orders enable row level security;
alter table public.admin_users enable row level security;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Users can read their admin membership" on public.admin_users;
create policy "Users can read their admin membership"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "Public can create contacts" on public.contacts;
create policy "Public can create contacts"
on public.contacts
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
on public.orders
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can view contacts" on public.contacts;
create policy "Admins can view contacts"
on public.contacts
for select
to authenticated
using (exists (
  select 1 from public.admin_users admin
  where admin.user_id = auth.uid()
));

drop policy if exists "Admins can view orders" on public.orders;
create policy "Admins can view orders"
on public.orders
for select
to authenticated
using (exists (
  select 1 from public.admin_users admin
  where admin.user_id = auth.uid()
));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (exists (
  select 1 from public.admin_users admin
  where admin.user_id = auth.uid()
))
with check (exists (
  select 1 from public.admin_users admin
  where admin.user_id = auth.uid()
));

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (exists (
  select 1 from public.admin_users admin
  where admin.user_id = auth.uid()
));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products
for update
to authenticated
using (exists (
  select 1 from public.admin_users admin
  where admin.user_id = auth.uid()
))
with check (exists (
  select 1 from public.admin_users admin
  where admin.user_id = auth.uid()
));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products
for delete
to authenticated
using (exists (
  select 1 from public.admin_users admin
  where admin.user_id = auth.uid()
));

drop policy if exists "Admins can view products in admin" on public.products;
create policy "Admins can view products in admin"
on public.products
for select
to authenticated
using (true);

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.admin_users admin
    where admin.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.admin_users admin
    where admin.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.admin_users admin
    where admin.user_id = auth.uid()
  )
);

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.admin_users admin
    where admin.user_id = auth.uid()
  )
);
