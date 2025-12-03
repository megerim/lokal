-- =============================================================================
-- Combined Migration for Lokal Project - UpdatePlan Features
-- Run this in your Supabase SQL Editor
-- =============================================================================
-- This migration adds:
-- 1. activity_requests table (for payment-based activity participation)
-- 2. market_applications table (for Christmas market stall applications)
-- =============================================================================

-- =============================================================================
-- 1. ACTIVITY REQUESTS TABLE
-- For handling payment-based participation in activities
-- =============================================================================

-- Create activity_requests table
CREATE TABLE IF NOT EXISTS public.activity_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending_payment', 'payment_submitted', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending_payment',
    payment_method TEXT DEFAULT 'bank_transfer',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(activity_id, user_id)
);

-- Enable RLS
ALTER TABLE public.activity_requests ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view their own requests"
    ON public.activity_requests
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
    ON public.activity_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests"
    ON public.activity_requests
    FOR UPDATE
    USING (auth.uid() = user_id AND status IN ('pending_payment', 'payment_submitted'));

CREATE POLICY "Users can delete their own pending requests"
    ON public.activity_requests
    FOR DELETE
    USING (auth.uid() = user_id AND status IN ('pending_payment', 'payment_submitted'));

-- Policies for admins
CREATE POLICY "Admins can view all requests"
    ON public.activity_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all requests"
    ON public.activity_requests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Updated at trigger for activity_requests
CREATE OR REPLACE FUNCTION update_activity_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trigger_update_activity_requests_updated_at ON public.activity_requests;
CREATE TRIGGER trigger_update_activity_requests_updated_at
    BEFORE UPDATE ON public.activity_requests
    FOR EACH ROW EXECUTE FUNCTION update_activity_requests_updated_at();

-- Indexes for activity_requests
CREATE INDEX IF NOT EXISTS idx_activity_requests_user_id ON public.activity_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_requests_activity_id ON public.activity_requests(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_requests_status ON public.activity_requests(status);

COMMENT ON TABLE public.activity_requests IS 'Stores activity participation requests with payment tracking';

-- =============================================================================
-- 2. MARKET APPLICATIONS TABLE
-- For Christmas market stall applications
-- =============================================================================

-- Create market_applications table
CREATE TABLE IF NOT EXISTS public.market_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    product_description TEXT NOT NULL,
    instagram_handle TEXT,
    logo_url TEXT,
    participation_days TEXT[] DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved_waiting_payment', 'payment_submitted', 'completed', 'rejected')) DEFAULT 'pending',
    payment_confirmed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.market_applications ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view their own applications"
    ON public.market_applications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
    ON public.market_applications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending applications"
    ON public.market_applications
    FOR UPDATE
    USING (auth.uid() = user_id AND status IN ('pending', 'approved_waiting_payment'));

-- Policies for admins
CREATE POLICY "Admins can view all applications"
    ON public.market_applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all applications"
    ON public.market_applications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Updated at trigger for market_applications
CREATE OR REPLACE FUNCTION update_market_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trigger_update_market_applications_updated_at ON public.market_applications;
CREATE TRIGGER trigger_update_market_applications_updated_at
    BEFORE UPDATE ON public.market_applications
    FOR EACH ROW EXECUTE FUNCTION update_market_applications_updated_at();

-- Indexes for market_applications
CREATE INDEX IF NOT EXISTS idx_market_applications_user_id ON public.market_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_market_applications_status ON public.market_applications(status);

COMMENT ON TABLE public.market_applications IS 'Stores Christmas market stall applications with payment tracking';

-- =============================================================================
-- VERIFICATION QUERIES (uncomment to test)
-- =============================================================================

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('activity_requests', 'market_applications');
-- SELECT * FROM pg_policies WHERE tablename IN ('activity_requests', 'market_applications');
