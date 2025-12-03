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

-- Policies
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

-- Updated at trigger
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

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_activity_requests_user_id ON public.activity_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_requests_activity_id ON public.activity_requests(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_requests_status ON public.activity_requests(status);
