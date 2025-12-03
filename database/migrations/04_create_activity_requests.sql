-- Create activity_requests table
CREATE TABLE IF NOT EXISTS public.activity_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending_payment', 'payment_submitted', 'approved', 'rejected', 'cancelled')),
    payment_method TEXT DEFAULT 'bank_transfer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.activity_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own requests"
    ON public.activity_requests
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
    ON public.activity_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
    ON public.activity_requests
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
    ON public.activity_requests
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

CREATE POLICY "Admins can update all requests"
    ON public.activity_requests
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
