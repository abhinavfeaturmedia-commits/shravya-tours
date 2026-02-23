-- ======================================================================================
-- SHRAVYA TOURS - MASTER RESET SCRIPT (v1 to v6)
-- Warning: This script drops all tables and recreates the entire schema from scratch.
-- ======================================================================================

-- --------------------------------------------------------------------------------------
-- 0. DROP EXISTING TABLES (Safely cascade dependencies)
-- --------------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.lead_logs CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.user_activities CASCADE;
DROP TABLE IF EXISTS public.assignment_rules CASCADE;
DROP TABLE IF EXISTS public.time_sessions CASCADE;
DROP TABLE IF EXISTS public.daily_targets CASCADE;
DROP TABLE IF EXISTS public.proposals CASCADE;
DROP TABLE IF EXISTS public.follow_ups CASCADE;

DROP TABLE IF EXISTS public.cms_posts CASCADE;
DROP TABLE IF EXISTS public.cms_gallery_images CASCADE;
DROP TABLE IF EXISTS public.cms_testimonials CASCADE;
DROP TABLE IF EXISTS public.cms_banners CASCADE;

DROP TABLE IF EXISTS public.master_terms_templates CASCADE;
DROP TABLE IF EXISTS public.master_lead_sources CASCADE;
DROP TABLE IF EXISTS public.master_plans CASCADE;
DROP TABLE IF EXISTS public.master_transports CASCADE;
DROP TABLE IF EXISTS public.master_activities CASCADE;
DROP TABLE IF EXISTS public.master_meal_plans CASCADE;
DROP TABLE IF EXISTS public.master_room_types CASCADE;
DROP TABLE IF EXISTS public.master_hotels CASCADE;
DROP TABLE IF EXISTS public.master_locations CASCADE;

DROP TABLE IF EXISTS public.account_transactions CASCADE;
DROP TABLE IF EXISTS public.booking_transactions CASCADE;
DROP TABLE IF EXISTS public.daily_inventory CASCADE;
DROP TABLE IF EXISTS public.invoice_sequences CASCADE;

DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.staff_members CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;

DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.packages CASCADE;

-- --------------------------------------------------------------------------------------
-- 1. BASE SYSTEM TABLES (Auth, CMS, Master Data)
-- --------------------------------------------------------------------------------------

-- Staff Members
CREATE TABLE IF NOT EXISTS public.staff_members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'Agent',
  user_type TEXT DEFAULT 'Staff',
  department TEXT DEFAULT 'Sales',
  status TEXT DEFAULT 'Active',
  initials TEXT,
  color TEXT DEFAULT 'indigo',
  permissions JSONB DEFAULT '{}'::jsonb,
  query_scope TEXT DEFAULT 'Show All Queries',
  whatsapp_scope TEXT DEFAULT 'All Messages',
  last_active TIMESTAMPTZ
);

-- Vendors
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  category TEXT,
  location TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  rating NUMERIC DEFAULT 0,
  balance_due NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active'
);

-- Accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  company_name TEXT,
  type TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  current_balance NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active'
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  type TEXT DEFAULT 'New',
  status TEXT DEFAULT 'Active',
  total_spent NUMERIC DEFAULT 0,
  bookings_count INTEGER DEFAULT 0
);

-- Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  type TEXT,
  budget NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  leads INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  roi NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Master Data Tables
CREATE TABLE public.master_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  region TEXT,
  status TEXT DEFAULT 'Active'
);

CREATE TABLE public.master_hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location_id TEXT NOT NULL,
  star_rating INTEGER DEFAULT 3,
  contact_name TEXT,
  contact_phone TEXT,
  contract_rate NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active'
);

CREATE TABLE public.master_room_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.master_meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.master_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location_id TEXT NOT NULL,
    duration TEXT,
    cost NUMERIC DEFAULT 0,
    category TEXT,
    image TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.master_transports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    base_rate NUMERIC DEFAULT 0,
    image TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.master_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    duration INTEGER NOT NULL,
    location_id TEXT NOT NULL,
    estimated_cost NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Draft',
    days JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.master_lead_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    image TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.master_terms_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT,
    is_default BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CMS / Website Content Tables
CREATE TABLE public.cms_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    cta_text TEXT,
    cta_link TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.cms_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    location TEXT,
    rating INTEGER DEFAULT 5,
    text TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.cms_gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.cms_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    author TEXT,
    published_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Draft',
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------------------------
-- 2. CORE BUSINESS LOGIC (Packages, Bookings, Leads)
-- --------------------------------------------------------------------------------------

-- Packages
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  duration INTEGER,
  location TEXT,
  price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  image TEXT
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date DATE,
  amount NUMERIC DEFAULT 0,
  package_id UUID REFERENCES packages(id),
  status TEXT DEFAULT 'Pending',
  payment_status TEXT DEFAULT 'Unpaid',
  invoice_no TEXT
);

-- Booking Transactions (Ledger)
CREATE TABLE IF NOT EXISTS public.booking_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Payment', 'Refund', 'Adjustment')),
    method VARCHAR(50) NOT NULL, 
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Account Transactions (Ledger)
CREATE TABLE IF NOT EXISTS public.account_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Credit', 'Debit')),
    description TEXT,
    reference VARCHAR(255), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Daily Inventory
CREATE TABLE IF NOT EXISTS public.daily_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 40,
    booked INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_capacity_limits CHECK (booked <= capacity)
);

-- Invoices Sequence Trackers
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
    prefix VARCHAR(10) PRIMARY KEY,
    current_value INTEGER NOT NULL DEFAULT 0
);

-- Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  travelers TEXT,
  budget TEXT,
  type TEXT DEFAULT 'Tour',
  status TEXT DEFAULT 'New',
  priority TEXT DEFAULT 'Medium',
  potential_value NUMERIC DEFAULT 0,
  source TEXT DEFAULT 'Website',
  preferences JSONB,
  avatar_color TEXT,
  assigned_to TEXT,
  whatsapp TEXT,
  is_whatsapp_same BOOLEAN,
  service_type TEXT,
  pax_adult INTEGER,
  pax_child INTEGER,
  pax_infant INTEGER
);

-- Lead Logs
CREATE TABLE IF NOT EXISTS public.lead_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------------------------
-- 3. PRODUCTIVITY & INTERNAL TRACKING
-- --------------------------------------------------------------------------------------

CREATE TABLE public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_enabled BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Pending',
    priority TEXT DEFAULT 'Medium',
    assigned_to INTEGER,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    options JSONB DEFAULT '[]'::jsonb,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.daily_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id INTEGER NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    target_leads INTEGER DEFAULT 0,
    target_calls INTEGER DEFAULT 0,
    target_conversions INTEGER DEFAULT 0,
    target_bookings INTEGER DEFAULT 0,
    actual_leads INTEGER DEFAULT 0,
    actual_calls INTEGER DEFAULT 0,
    actual_conversions INTEGER DEFAULT 0,
    actual_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(staff_id, date)
);

CREATE TABLE public.time_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id INTEGER NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    task_id UUID,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0,
    idle_time INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.assignment_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    strategy TEXT NOT NULL,
    trigger_on TEXT NOT NULL,
    eligible_staff_ids JSONB DEFAULT '[]'::jsonb,
    priority INTEGER DEFAULT 1,
    conditions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Activities (Deprecated for Audit Logs, but kept for legacy UI data loads if any)
CREATE TABLE public.user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id INTEGER NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    staff_name TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Audit Logs (New Centralized Event System)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Info', 'Warning', 'Critical')),
    performed_by TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------------------------
-- 4. APPLY ROW LEVEL SECURITY (RLS) & PERMISSIVE POLICIES
-- --------------------------------------------------------------------------------------

-- Enable RLS for all tables
DO $$ 
DECLARE
    t_name text;
BEGIN
    FOR t_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_name);
        EXECUTE format('DROP POLICY IF EXISTS "Enable all access for all users on %I" ON public.%I;', t_name, t_name);
        EXECUTE format('CREATE POLICY "Enable all access for all users on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t_name, t_name);
    END LOOP;
END $$;

-- --------------------------------------------------------------------------------------
-- 5. RECREATE DATABASE FUNCTIONS (Invoice & Inventory Sequence Handlers)
-- --------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.generate_invoice_number(param_type VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_prefix VARCHAR(10);
    v_type_code VARCHAR(2);
    v_sequence INTEGER;
    v_result VARCHAR(20);
BEGIN
    CASE param_type
        WHEN 'Bus' THEN v_type_code := 'BU';
        WHEN 'Car' THEN v_type_code := 'CB';
        WHEN 'Hotel' THEN v_type_code := 'HL';
        WHEN 'Flight' THEN v_type_code := 'FL';
        WHEN 'Tour' THEN v_type_code := 'TP';
        WHEN 'Train' THEN v_type_code := 'RL';
        WHEN 'Activity' THEN v_type_code := 'AT';
        WHEN 'Visa' THEN v_type_code := 'VS';
        ELSE v_type_code := 'G';
    END CASE;

    v_prefix := v_type_code || '-' || TO_CHAR(CURRENT_DATE, 'YYMM');

    INSERT INTO public.invoice_sequences (prefix, current_value)
    VALUES (v_prefix, 1)
    ON CONFLICT (prefix) DO UPDATE
    SET current_value = public.invoice_sequences.current_value + 1
    RETURNING current_value INTO v_sequence;

    v_result := v_prefix || '-' || LPAD(v_sequence::TEXT, 4, '0');
    RETURN v_result;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION public.book_inventory_slot(
    p_date DATE,
    p_pax_count INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_slot RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_slot 
    FROM public.daily_inventory 
    WHERE date = p_date 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Inventory slot for date does not exist');
    END IF;

    IF v_slot.is_blocked THEN
        RETURN jsonb_build_object('success', false, 'error', 'Date is blocked for bookings');
    END IF;

    IF (v_slot.booked + p_pax_count) > v_slot.capacity THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient capacity for this date');
    END IF;

    UPDATE public.daily_inventory
    SET booked = booked + p_pax_count
    WHERE date = p_date;

    RETURN jsonb_build_object('success', true, 'message', 'Inventory locked successfully');
END;
$$ LANGUAGE plpgsql VOLATILE;

-- --------------------------------------------------------------------------------------
-- END OF SCRIPT. 
-- Schema is now fully provisioned and securely integrated with permissive RLS logic.
-- --------------------------------------------------------------------------------------
