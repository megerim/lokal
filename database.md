-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  activity_type text,
  date_time timestamp with time zone NOT NULL,
  duration_hours numeric,
  location text,
  max_participants integer,
  image_url text,
  created_by uuid,
  managed_by uuid,
  request_id uuid,
  group_id uuid,
  status text DEFAULT 'upcoming'::text CHECK (status = ANY (ARRAY['upcoming'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT activities_managed_by_fkey FOREIGN KEY (managed_by) REFERENCES auth.users(id),
  CONSTRAINT activities_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.etkinlik_talepleri(id),
  CONSTRAINT activities_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.social_groups(id)
);
CREATE TABLE public.activity_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  attended boolean DEFAULT false,
  checked_in_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT activity_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT activity_attendance_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id),
  CONSTRAINT activity_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.activity_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name character varying NOT NULL,
  user_avatar character varying,
  content text NOT NULL,
  parent_id uuid,
  is_organizer_response boolean NOT NULL DEFAULT false,
  is_edited boolean NOT NULL DEFAULT false,
  edited_at timestamp with time zone,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activity_comments_pkey PRIMARY KEY (id),
  CONSTRAINT activity_comments_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id),
  CONSTRAINT activity_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT activity_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.activity_comments(id)
);
CREATE TABLE public.activity_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name character varying NOT NULL,
  user_avatar character varying,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  photos ARRAY,
  helpful_count integer NOT NULL DEFAULT 0,
  is_verified_attendance boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activity_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT activity_ratings_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id),
  CONSTRAINT activity_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.activity_statistics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL UNIQUE,
  total_views integer NOT NULL DEFAULT 0,
  total_registrations integer NOT NULL DEFAULT 0,
  total_attendees integer NOT NULL DEFAULT 0,
  total_ratings integer NOT NULL DEFAULT 0,
  average_rating numeric NOT NULL DEFAULT 0.00 CHECK (average_rating >= 0::numeric AND average_rating <= 5::numeric),
  total_comments integer NOT NULL DEFAULT 0,
  completion_rate numeric NOT NULL DEFAULT 0.00 CHECK (completion_rate >= 0::numeric AND completion_rate <= 100::numeric),
  no_show_rate numeric NOT NULL DEFAULT 0.00 CHECK (no_show_rate >= 0::numeric AND no_show_rate <= 100::numeric),
  last_calculated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activity_statistics_pkey PRIMARY KEY (id),
  CONSTRAINT activity_statistics_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id)
);
CREATE TABLE public.club_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  user_avatar text,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT club_comments_pkey PRIMARY KEY (id),
  CONSTRAINT club_comments_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.social_groups(id),
  CONSTRAINT club_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.coffee_vouchers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  voucher_code text NOT NULL UNIQUE,
  reason text CHECK (reason = ANY (ARRAY['birthday'::text, 'loyalty'::text, 'special'::text])),
  is_used boolean DEFAULT false,
  used_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT coffee_vouchers_pkey PRIMARY KEY (id),
  CONSTRAINT coffee_vouchers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.comment_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text DEFAULT 'like'::text CHECK (reaction_type = ANY (ARRAY['like'::text, 'heart'::text, 'applause'::text, 'thinking'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT comment_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT comment_reactions_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.club_comments(id),
  CONSTRAINT comment_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.duyurular (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  group_id uuid,
  meeting_datetime timestamp with time zone,
  is_club_only boolean DEFAULT false,
  CONSTRAINT duyurular_pkey PRIMARY KEY (id),
  CONSTRAINT duyurular_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT duyurular_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.social_groups(id)
);
CREATE TABLE public.etkinlik_talepleri (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  requested_by uuid NOT NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  assigned_to uuid,
  assigned_at timestamp with time zone,
  admin_response text,
  event_type text,
  expected_participants text,
  preferred_date text,
  duration text,
  budget_range text,
  organization_name text,
  phone_number text,
  requester_ip text,
  CONSTRAINT etkinlik_talepleri_pkey PRIMARY KEY (id),
  CONSTRAINT etkinlik_talepleri_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id),
  CONSTRAINT etkinlik_talepleri_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id)
);
CREATE TABLE public.group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['member'::text, 'organizer'::text, 'admin'::text])),
  joined_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT group_members_pkey PRIMARY KEY (id),
  CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.social_groups(id),
  CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.katilimcilar (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  duyuru_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT katilimcilar_pkey PRIMARY KEY (id),
  CONSTRAINT katilimcilar_duyuru_id_fkey FOREIGN KEY (duyuru_id) REFERENCES public.duyurular(id),
  CONSTRAINT katilimcilar_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.membership_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  request_message text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT membership_requests_pkey PRIMARY KEY (id),
  CONSTRAINT membership_requests_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.social_groups(id),
  CONSTRAINT membership_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT membership_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.notification_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type character varying NOT NULL UNIQUE,
  category character varying NOT NULL,
  title_template text NOT NULL,
  message_template text NOT NULL,
  email_subject_template text,
  email_body_template text,
  variables ARRAY NOT NULL DEFAULT '{}'::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notification_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['activity_reminder'::character varying, 'activity_reminder_24h'::character varying, 'activity_reminder_1h'::character varying, 'activity_update'::character varying, 'activity_cancelled'::character varying, 'new_activity'::character varying, 'social_interaction'::character varying, 'system'::character varying]::text[])),
  category character varying NOT NULL CHECK (category::text = ANY (ARRAY['activity'::character varying, 'social'::character varying, 'system'::character varying]::text[])),
  is_read boolean NOT NULL DEFAULT false,
  is_email_sent boolean NOT NULL DEFAULT false,
  related_id uuid,
  related_type character varying CHECK (related_type::text = ANY (ARRAY['activity'::character varying, 'group'::character varying, 'user'::character varying, 'comment'::character varying]::text[])),
  action_url character varying,
  scheduled_for timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.personal_letters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT personal_letters_pkey PRIMARY KEY (id),
  CONSTRAINT personal_letters_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  image_url text,
  category text DEFAULT 'other'::text CHECK (category = ANY (ARRAY['cup'::text, 'glass'::text, 'ceramic'::text, 'accessory'::text, 'other'::text])),
  is_available boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.social_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text,
  recurring_day text,
  time text,
  location text,
  max_members integer,
  image_url text,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT social_groups_pkey PRIMARY KEY (id),
  CONSTRAINT social_groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.user_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  connected_user_id uuid NOT NULL,
  connection_type character varying NOT NULL CHECK (connection_type::text = ANY (ARRAY['follower'::character varying, 'following'::character varying, 'friend'::character varying]::text[])),
  status character varying NOT NULL DEFAULT 'accepted'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'accepted'::character varying, 'blocked'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_connections_pkey PRIMARY KEY (id),
  CONSTRAINT user_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_connections_connected_user_id_fkey FOREIGN KEY (connected_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  activity_reminders_24h boolean NOT NULL DEFAULT true,
  activity_reminders_1h boolean NOT NULL DEFAULT true,
  activity_updates boolean NOT NULL DEFAULT true,
  new_activities boolean NOT NULL DEFAULT true,
  social_notifications boolean NOT NULL DEFAULT true,
  marketing_emails boolean NOT NULL DEFAULT false,
  preferred_reminder_time character varying NOT NULL DEFAULT '09:00'::character varying,
  timezone character varying NOT NULL DEFAULT 'Europe/Istanbul'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['admin'::text, 'member'::text])),
  birthday date,
  phone_number text,
  bio text,
  avatar_url text,
  coffee_voucher_count integer DEFAULT 0,
  activity_attendance_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- NEW TABLES FOR UPDATE PLAN --

CREATE TABLE public.activity_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name text,
  user_email text,
  status text NOT NULL DEFAULT 'pending_payment' CHECK (status = ANY (ARRAY['pending_payment'::text, 'payment_submitted'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text])),
  payment_method text DEFAULT 'bank_transfer',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT activity_requests_pkey PRIMARY KEY (id),
  CONSTRAINT activity_requests_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE,
  CONSTRAINT activity_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT activity_requests_unique UNIQUE (activity_id, user_id)
);

CREATE TABLE public.market_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_name text NOT NULL,
  product_description text NOT NULL,
  instagram_handle text,
  logo_url text,
  participation_days text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'approved_waiting_payment'::text, 'payment_submitted'::text, 'completed'::text, 'rejected'::text])),
  payment_confirmed_at timestamp with time zone,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT market_applications_pkey PRIMARY KEY (id),
  CONSTRAINT market_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);