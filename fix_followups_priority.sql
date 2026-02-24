-- Migration to add priority column to follow_ups if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'follow_ups'
          AND column_name = 'priority'
    ) THEN
        ALTER TABLE public.follow_ups ADD COLUMN priority TEXT DEFAULT 'Medium';
    END IF;
END $$;
