export interface Announcement {
  id: string
  title: string
  description: string
  image_url?: string
  created_by: string
  group_id?: string
  meeting_datetime?: string
  is_club_only?: boolean
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  duyuru_id: string
  user_id: string
  user_name: string
  user_email: string
  created_at: string
}

export interface ActivityRequest {
  id: string
  title: string
  description: string
  requested_by: string
  requester_name: string
  requester_email: string
  status: 'pending' | 'approved' | 'rejected'
  assigned_to?: string
  assigned_at?: string
  admin_response?: string
  created_at: string
  updated_at: string
}

export interface SocialGroup {
  id: string
  name: string
  description: string
  category?: string
  recurring_day?: string
  time?: string
  location?: string
  max_members?: number
  image_url?: string
  is_active?: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  user_name: string
  user_email: string
  role: 'member' | 'admin'
  joined_at: string
}

export interface ErrorHandlerInterface {
  logError: (message: string, error?: unknown) => void
  showUserError: (message: string) => void
}

export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  role: 'admin' | 'member'
  birthday?: string
  phone_number?: string
  bio?: string
  avatar_url?: string
  coffee_voucher_count: number
  activity_attendance_count: number
  created_at: string
  updated_at: string
}

export interface MembershipRequest {
  id: string
  group_id: string
  user_id: string
  user_name: string
  user_email: string
  request_message?: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
}

export interface ClubComment {
  id: string
  group_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  content: string
  is_pinned?: boolean
  is_edited?: boolean
  edited_at?: string
  created_at: string
  reactions?: CommentReaction[]
}

export interface CommentReaction {
  id: string
  comment_id: string
  user_id: string
  reaction_type: 'like' | 'heart' | 'applause' | 'thinking'
  created_at: string
}

export interface Activity {
  id: string
  title: string
  description: string
  activity_type?: string
  date_time: string
  duration_hours?: number
  location?: string
  max_participants?: number
  image_url?: string
  created_by?: string
  managed_by?: string
  request_id?: string
  group_id?: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface CoffeeVoucher {
  id: string
  user_id: string
  voucher_code: string
  reason: 'birthday' | 'loyalty' | 'special'
  is_used: boolean
  used_at?: string
  expires_at?: string
  created_at: string
}

export interface ActivityAttendance {
  id: string
  activity_id: string
  user_id: string
  user_name: string
  attended: boolean
  checked_in_at?: string
  created_at: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  image_url?: string
  category: 'cup' | 'glass' | 'ceramic' | 'accessory' | 'other'
  is_available: boolean
  display_order: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface PersonalLetter {
  id: string
  user_id: string
  title: string
  content: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

// Extended user profile with social features
export interface UserProfileExtended extends UserProfile {
  notification_preferences?: NotificationPreferences
  privacy_settings?: PrivacySettings
  interests?: string[]
  social_connections?: string[]
  achievements?: UserAchievement[]
}

export interface NotificationPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  activity_reminders: boolean
  new_comments: boolean
  new_followers: boolean
  created_at: string
  updated_at: string
}

export interface PrivacySettings {
  id: string
  user_id: string
  show_profile: boolean
  show_activities: boolean
  show_connections: boolean
  allow_messages: boolean
  activity_visibility: 'public' | 'friends' | 'private'
  created_at: string
  updated_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_type: 'first_activity' | 'ten_activities' | 'regular_attendee' | 'social_butterfly' | 'activity_streak'
  earned_at: string
  details?: Record<string, any>
}

export interface ActivityComment {
  id: string
  activity_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  content: string
  parent_id?: string
  is_organizer_response?: boolean
  is_edited?: boolean
  edited_at?: string
  created_at: string
  likes_count?: number
  replies?: ActivityComment[]
}

export interface ActivityRating {
  id: string
  activity_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  rating: number
  review?: string
  photos?: string[]
  helpful_count: number
  is_verified_attendance?: boolean
  created_at: string
  updated_at: string
}

export interface ActivityParticipant {
  id: string
  activity_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  registration_date: string
  attended?: boolean
  is_friend?: boolean
  mutual_activities_count?: number
}

export interface UserConnection {
  id: string
  follower_id: string
  following_id: string
  connection_type: 'follow' | 'friend'
  created_at: string
}

export interface ActivityStatistics {
  total_activities: number
  activities_by_category: Record<string, number>
  monthly_trend: MonthlyActivityData[]
  favorite_types: string[]
  streak_days: number
  total_hours: number
}

export interface MonthlyActivityData {
  month: string
  count: number
  hours: number
}

// Notification System Types
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'activity_reminder' | 'activity_reminder_24h' | 'activity_reminder_1h' | 'activity_update' | 'activity_cancelled' | 'new_activity' | 'social_interaction' | 'system'
  category: 'activity' | 'social' | 'system'
  is_read: boolean
  is_email_sent: boolean
  related_id?: string // activity_id, group_id, etc.
  related_type?: 'activity' | 'group' | 'user' | 'comment'
  action_url?: string
  scheduled_for?: string // for reminders
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean // Added for SMS
  activity_reminders_24h: boolean
  activity_reminders_1h: boolean
  activity_updates: boolean
  new_activities: boolean
  social_notifications: boolean
  marketing_emails: boolean
  preferred_reminder_time: string // HH:MM format
  timezone: string
  created_at: string
  updated_at: string
}

export interface UserConnections {
  id: string
  user_id: string
  connected_user_id: string
  connection_type: 'follower' | 'following' | 'friend'
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
}

export interface ActivityStatisticsNew {
  id: string
  activity_id: string
  total_views: number
  total_registrations: number
  total_attendees: number
  total_ratings: number
  average_rating: number
  total_comments: number
  completion_rate: number
  no_show_rate: number
  last_calculated: string
  created_at: string
  updated_at: string
}

export interface NotificationTemplate {
  id: string
  type: string
  category: string
  title_template: string
  message_template: string
  email_subject_template?: string
  email_body_template?: string
  variables: string[] // JSON array of template variables
  is_active: boolean
  created_at: string
  updated_at: string
}

// Activity participation request (payment flow)
export interface ActivityParticipationRequest {
  id: string
  activity_id: string
  user_id: string
  user_name?: string
  user_email?: string
  status: 'pending_payment' | 'payment_submitted' | 'approved' | 'rejected' | 'cancelled'
  payment_method?: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

// Christmas market application
export interface MarketApplication {
  id: string
  user_id: string
  brand_name: string
  product_description: string
  instagram_handle?: string
  logo_url?: string
  participation_days?: string[]
  status: 'pending' | 'approved_waiting_payment' | 'payment_submitted' | 'completed' | 'rejected'
  payment_confirmed_at?: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      duyurular: {
        Row: Announcement
        Insert: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>
      }
      katilimcilar: {
        Row: Participant
        Insert: Omit<Participant, 'id' | 'created_at'>
        Update: Partial<Omit<Participant, 'id' | 'created_at'>>
      }
      etkinlik_talepleri: {
        Row: ActivityRequest
        Insert: Omit<ActivityRequest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ActivityRequest, 'id' | 'created_at' | 'updated_at'>>
      }
      social_groups: {
        Row: SocialGroup
        Insert: Omit<SocialGroup, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SocialGroup, 'id' | 'created_at' | 'updated_at'>>
      }
      group_members: {
        Row: GroupMember
        Insert: Omit<GroupMember, 'id' | 'joined_at'>
        Update: Partial<Omit<GroupMember, 'id' | 'joined_at'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'coffee_voucher_count' | 'activity_attendance_count'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      membership_requests: {
        Row: MembershipRequest
        Insert: Omit<MembershipRequest, 'id' | 'created_at'>
        Update: Partial<Omit<MembershipRequest, 'id' | 'created_at'>>
      }
      club_comments: {
        Row: ClubComment
        Insert: Omit<ClubComment, 'id' | 'created_at' | 'reactions'>
        Update: Partial<Omit<ClubComment, 'id' | 'created_at' | 'reactions'>>
      }
      comment_reactions: {
        Row: CommentReaction
        Insert: Omit<CommentReaction, 'id' | 'created_at'>
        Update: Partial<Omit<CommentReaction, 'id' | 'created_at'>>
      }
      activities: {
        Row: Activity
        Insert: Omit<Activity, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>
      }
      coffee_vouchers: {
        Row: CoffeeVoucher
        Insert: Omit<CoffeeVoucher, 'id' | 'created_at'>
        Update: Partial<Omit<CoffeeVoucher, 'id' | 'created_at'>>
      }
      activity_attendance: {
        Row: ActivityAttendance
        Insert: Omit<ActivityAttendance, 'id' | 'created_at'>
        Update: Partial<Omit<ActivityAttendance, 'id' | 'created_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      personal_letters: {
        Row: PersonalLetter
        Insert: Omit<PersonalLetter, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PersonalLetter, 'id' | 'created_at' | 'updated_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at' | 'updated_at'>>
      }
      user_preferences: {
        Row: UserPreferences
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>>
      }
      user_connections: {
        Row: UserConnections
        Insert: Omit<UserConnections, 'id' | 'created_at'>
        Update: Partial<Omit<UserConnections, 'id' | 'created_at'>>
      }
      activity_statistics: {
        Row: ActivityStatisticsNew
        Insert: Omit<ActivityStatisticsNew, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ActivityStatisticsNew, 'id' | 'created_at' | 'updated_at'>>
      }
      activity_ratings: {
        Row: ActivityRating
        Insert: Omit<ActivityRating, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ActivityRating, 'id' | 'created_at' | 'updated_at'>>
      }
      activity_comments: {
        Row: ActivityComment
        Insert: Omit<ActivityComment, 'id' | 'created_at' | 'replies'>
        Update: Partial<Omit<ActivityComment, 'id' | 'created_at' | 'replies'>>
      }
      notification_templates: {
        Row: NotificationTemplate
        Insert: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}