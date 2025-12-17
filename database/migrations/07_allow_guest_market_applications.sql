-- Migration: Allow guest market applications
-- Make user_id nullable and add guest contact fields

-- 1. Make user_id nullable (remove NOT NULL constraint)
ALTER TABLE public.market_applications 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop the foreign key constraint and recreate it with ON DELETE SET NULL
ALTER TABLE public.market_applications 
DROP CONSTRAINT IF EXISTS market_applications_user_id_fkey;

ALTER TABLE public.market_applications 
ADD CONSTRAINT market_applications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Add new columns for guest applications
ALTER TABLE public.market_applications 
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT,
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false;

-- 4. Add a check constraint to ensure guest applications have contact info
ALTER TABLE public.market_applications 
ADD CONSTRAINT guest_must_have_contact 
CHECK (
  (is_guest = false) OR 
  (is_guest = true AND (guest_email IS NOT NULL OR guest_phone IS NOT NULL))
);

-- 5. Create index for guest applications
CREATE INDEX IF NOT EXISTS idx_market_applications_is_guest 
ON public.market_applications(is_guest);

-- 6. Add RLS policy for service role to insert guest applications
-- The service role bypasses RLS by default, so no explicit policy needed
-- But we can add a policy for anon role if needed in the future

COMMENT ON COLUMN public.market_applications.guest_email IS 'Email address for guest (non-logged-in) applicants';
COMMENT ON COLUMN public.market_applications.guest_phone IS 'Phone number for guest (non-logged-in) applicants';
COMMENT ON COLUMN public.market_applications.is_guest IS 'Whether this application was submitted without login';
