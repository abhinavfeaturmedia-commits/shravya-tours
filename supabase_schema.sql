-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PACKAGES TABLE
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

-- 2. BOOKINGS TABLE
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. LEADS TABLE
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

-- 4. STAFF TABLE (Simple Role Management)
create table public.staff (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  role text default 'Agent', -- Admin, Agent, Manager
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS) POLICIES
-- For now, we allow public read access for Packages, but restrictive write.
alter table public.packages enable row level security;
alter table public.bookings enable row level security;
alter table public.leads enable row level security;

-- Policy: Everyone can view packages
create policy "Public packages are viewable by everyone"
  on packages for select
  using ( true );

-- Policy: Only authenticated users can insert bookings (e.g. via API or logged in staff)
-- Note: valid for public website if we use service role or anon key with specific limits. 
-- For this MVP, we'll allow public insert to Bookings for the "Secure Spot" form to work anonymously.
create policy "Anyone can create bookings"
  on bookings for insert
  with check ( true );

-- Policy: Only Staff can view Bookings
create policy "Staff can view all bookings"
  on bookings for select
  using ( auth.role() = 'authenticated' );

-- Policy: Only Staff can view/edit Leads
create policy "Staff can view leads"
  on leads for select
  using ( auth.role() = 'authenticated' );
