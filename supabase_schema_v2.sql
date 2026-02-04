
-- Enable RLS
alter table packages enable row level security;
alter table bookings enable row level security;
alter table leads enable row level security;

-- Create Policies (Allow All for now, but explicit)
create policy "Enable all access for all users" on packages for all using (true);
create policy "Enable all access for all users" on bookings for all using (true);
create policy "Enable all access for all users" on leads for all using (true);


-- 1. Staff Members Table
create table if not exists staff_members (
  id bigint primary key generated always as identity,
  created_at timestamptz default now(),
  email text unique not null,
  name text,
  role text default 'Agent', -- 'Administrator' | 'Agent'
  user_type text default 'Staff', -- 'Admin' | 'Staff'
  department text default 'Sales',
  status text default 'Active',
  initials text,
  color text default 'indigo',
  permissions jsonb default '{}'::jsonb,
  query_scope text default 'Show All Queries',
  whatsapp_scope text default 'All Messages',
  last_active timestamptz
);

alter table staff_members enable row level security;
create policy "Enable all access for all users" on staff_members for all using (true);

-- 2. Vendors Table
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  category text, -- 'Hotel' | 'Transport' | ...
  location text,
  contact_name text,
  contact_phone text,
  contact_email text,
  rating numeric default 0,
  balance_due numeric default 0,
  status text default 'Active'
);

alter table vendors enable row level security;
create policy "Enable all access for all users" on vendors for all using (true);

-- 3. Accounts Table
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  company_name text,
  type text, -- 'Agent' | 'Corporate'
  email text,
  phone text,
  location text,
  current_balance numeric default 0,
  status text default 'Active'
);

alter table accounts enable row level security;
create policy "Enable all access for all users" on accounts for all using (true);

-- 4. Customers Table (New)
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text,
  phone text,
  location text,
  type text default 'New',
  status text default 'Active',
  total_spent numeric default 0,
  bookings_count integer default 0
);

alter table customers enable row level security;
create policy "Enable all access for all users" on customers for all using (true);

-- 5. Master Data Tables
create table if not exists master_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text, -- 'City', 'State'
  region text,
  status text default 'Active'
);

alter table master_locations enable row level security;
create policy "Enable all access for all users" on master_locations for all using (true);
