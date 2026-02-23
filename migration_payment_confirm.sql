-- Migration: Add status to account_transactions

ALTER TABLE public.account_transactions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Pending' 
CHECK (status IN ('Pending', 'Confirmed', 'Rejected'));

-- Update existing transactions to be Confirmed (since they were already processed)
UPDATE public.account_transactions 
SET status = 'Confirmed' 
WHERE status = 'Pending';
