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

-- Updated at trigger
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

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_market_applications_user_id ON public.market_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_market_applications_status ON public.market_applications(status);
