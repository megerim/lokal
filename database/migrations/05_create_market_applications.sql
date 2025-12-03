-- Create market_applications table
CREATE TABLE IF NOT EXISTS public.market_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    brand_name TEXT NOT NULL,
    product_description TEXT NOT NULL,
    instagram_handle TEXT,
    website_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.market_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own applications"
    ON public.market_applications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
    ON public.market_applications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
    ON public.market_applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.user_id = auth.uid()
            AND group_members.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can update all applications"
    ON public.market_applications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.user_id = auth.uid()
            AND group_members.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.is_admin = true
        )
    );
