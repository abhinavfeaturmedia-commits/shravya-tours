-- -----------------------------------------------------------------------------
-- SUPABASE FRESH SETUP SCRIPT (V3)
-- -----------------------------------------------------------------------------
-- WARNING: This script will DROP all existing tables and data.
-- Run this in the Supabase SQL Editor.
-- -----------------------------------------------------------------------------

-- 1. CLEANUP (Drop existing tables)
drop table if exists public.daily_inventory cascade;
drop table if exists public.master_locations cascade;
drop table if exists public.customers cascade;
drop table if exists public.accounts cascade;
drop table if exists public.vendors cascade;
drop table if exists public.staff_members cascade;
drop table if exists public.staff cascade; -- Dropping old table if it exists
drop table if exists public.leads cascade;
drop table if exists public.bookings cascade;
drop table if exists public.packages cascade;

-- 2. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 3. TABLE DEFINITIONS

-- 3.1 PACKAGES (from v1)
create table public.packages (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price numeric not null,
  location text,
  days integer,
  image text,
  remaining_seats integer default 10,
  features text[], -- array of strings for icons/features
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3.2 BOOKINGS (from v1 + invoice_no)
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  email text,
  phone text,
  date date,
  status text default 'Pending', -- Pending, Confirmed, Cancelled
  payment_status text default 'Unpaid',
  amount numeric,
  package_id uuid references public.packages(id),
  invoice_no text, -- Added for consistency with API
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3.3 LEADS (from v1)
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text,
  destination text,
  status text default 'New', -- New, Contacted, Converted, Lost
  source text default 'Website',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3.4 STAFF MEMBERS (from v2, replacing 'staff')
create table public.staff_members (
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

-- 3.5 VENDORS (from v2)
create table public.vendors (
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

-- 3.6 ACCOUNTS (from v2)
create table public.accounts (
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

-- 3.7 CUSTOMERS (from v2)
create table public.customers (
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

-- 3.8 MASTER LOCATIONS (from v2)
create table public.master_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text, -- 'City', 'State'
  region text,
  status text default 'Active'
);

-- 3.9 DAILY INVENTORY (Inferred from code)
create table public.daily_inventory (
  date date primary key,
  capacity integer default 0,
  booked integer default 0,
  price numeric default 0,
  is_blocked boolean default false,
  created_at timestamptz default now()
);


-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- Enabling RLS on all tables
alter table packages enable row level security;
alter table bookings enable row level security;
alter table leads enable row level security;
alter table staff_members enable row level security;
alter table vendors enable row level security;
alter table accounts enable row level security;
alter table customers enable row level security;
alter table master_locations enable row level security;
alter table daily_inventory enable row level security;

-- Open Access Policies (For Development/MVP)
-- These allow PUBLIC access. Adjust for production!

create policy "Enable all access for packages" on packages for all using (true);
create policy "Enable all access for bookings" on bookings for all using (true);
create policy "Enable all access for leads" on leads for all using (true);
create policy "Enable all access for staff_members" on staff_members for all using (true);
create policy "Enable all access for vendors" on vendors for all using (true);
create policy "Enable all access for accounts" on accounts for all using (true);
create policy "Enable all access for customers" on customers for all using (true);
create policy "Enable all access for master_locations" on master_locations for all using (true);
create policy "Enable all access for daily_inventory" on daily_inventory for all using (true);

-- End of Setup Script
