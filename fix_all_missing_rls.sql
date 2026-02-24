-- Comprehensive Migration to enable RLS and add policies for all new tables

-- 1. Helper Function/Script essentially:
-- We'll just define the policies directly for each table.

DO $$
DECLARE
    t_name text;
    tables text[] := ARRAY[
        'master_hotels', 'master_room_types', 'master_meal_plans', 
        'master_activities', 'master_transports', 'master_plans', 
        'master_lead_sources', 'master_terms_templates', 
        'cms_banners', 'cms_testimonials', 'cms_gallery_images', 
        'cms_posts', 'follow_ups', 'proposals', 'daily_targets', 
        'time_sessions', 'assignment_rules', 'user_activities'
    ];
BEGIN
    FOREACH t_name IN ARRAY tables LOOP
        -- Attempt to enable RLS (safe to run multiple times)
        BEGIN
            EXECUTE 'ALTER TABLE IF EXISTS ' || t_name || ' ENABLE ROW LEVEL SECURITY;';
        EXCEPTION WHEN OTHERS THEN NULL; END;

        -- Attempt to create Select Policy
        BEGIN
            EXECUTE 'CREATE POLICY "Enable read access for all users" ON ' || t_name || ' FOR SELECT USING (true);';
        EXCEPTION WHEN OTHERS THEN NULL; END;

        -- Attempt to create All Access Policy for Authenticated
        BEGIN
            EXECUTE 'CREATE POLICY "Enable all access for auth users" ON ' || t_name || ' FOR ALL TO authenticated USING (true) WITH CHECK (true);';
        EXCEPTION WHEN OTHERS THEN NULL; END;
    END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
