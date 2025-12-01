"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { ensureUserProfile } from "@/lib/supabase/ensure-profile"
import { useAuth } from "@/components/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CoffeeVoucherDisplay } from "@/components/coffee-voucher-display"
import { LoadingSpinner } from "@/components/loading-spinner"
import { DashboardWidgets } from "@/components/dashboard/dashboard-widgets"
import { SocialGroupsNav } from "@/components/dashboard/social-groups-nav"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"
import { LetterHistory } from "@/components/dashboard/personal-letters/letter-history"
import { ActivityManager } from "@/components/dashboard/activity-manager"
import { GroupManager } from "@/components/dashboard/group-manager"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Calendar,
  FileText,
  Settings,
  Activity,
  TrendingUp,
  Clock,
  Star,
  Bell,
  LayoutDashboard
} from "lucide-react"
import type { UserProfile, SocialGroup, Activity as ActivityType, PersonalLetter } from "@/lib/types"
import { motion } from "framer-motion"

interface DashboardStats {
  totalGroups: number
  totalActivitiesAttended: number
  totalLettersWritten: number
  upcomingActivities: number
  unreadNotifications: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalActivitiesAttended: 0,
    totalLettersWritten: 0,
    upcomingActivities: 0,
    unreadNotifications: 0
  })
  const [showNotifications, setShowNotifications] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Ensure user profile exists
      const { profile: profileData } = await ensureUserProfile(user)
      setProfile(profileData)

      // Fetch user's joined groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)

      if (groupsError) throw groupsError

      // Fetch upcoming activities user is registered for
      const { data: upcomingActivities, error: activitiesError } = await supabase
        .from("activities")
        .select("id")
        .eq("status", "upcoming")
        .gte("date_time", new Date().toISOString())

      if (activitiesError) throw activitiesError

      // Fetch user's personal letters
      const { data: lettersData, error: lettersError } = await supabase
        .from("personal_letters")
        .select("id")
        .eq("user_id", user.id)

      if (lettersError && lettersError.code !== 'PGRST116') {
        throw lettersError
      }

      // Fetch unread notifications count
      let unreadNotifications = 0
      try {
        const response = await fetch('/api/notifications/unread-count')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            unreadNotifications = result.data.count
          }
        }
      } catch (notificationError) {
        console.warn('Could not fetch unread notifications:', notificationError)
      }

      setStats({
        totalGroups: groupsData?.length || 0,
        totalActivitiesAttended: profileData?.activity_attendance_count || 0,
        totalLettersWritten: lettersData?.length || 0,
        upcomingActivities: upcomingActivities?.length || 0,
        unreadNotifications
      })

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      console.error("Error details:", error?.message, error?.details, error?.hint)
      toast({
        title: "Hata",
        description: error?.message || "Panel verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş Gerekli</h1>
          <p>Kullanıcı panelinize erişmek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    )
  }

  const tabItems = [
    { value: "overview", label: "Genel Bakış", icon: LayoutDashboard },
    { value: "social-groups", label: "Sosyal Gruplar", icon: Users },
    { value: "activities", label: "Aktiviteler", icon: Calendar },
    { value: "letters", label: "Mektuplarım", icon: FileText },
    { value: "management", label: "Yönetim", icon: TrendingUp },
    { value: "settings", label: "Ayarlar", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Hoş Geldiniz, {profile?.full_name || user.email?.split("@")[0] || "Kullanıcı"}! 👋
            </h1>
            <p className="text-blue-100 max-w-2xl text-lg">
              Topluluk aktivitelerinizi ve kişisel deneyimlerinizi buradan yönetebilirsiniz.
              Bugün harika bir gün olsun!
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 blur-3xl transform rotate-12 translate-x-10" />
          <div className="absolute bottom-0 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full h-12 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-xl">
                <SelectValue placeholder="Sekme seçin" />
              </SelectTrigger>
              <SelectContent>
                {tabItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Tabs - Pill Design */}
          <div className="hidden md:block sticky top-4 z-30 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md py-2 -mx-4 px-4">
            <TabsList className="w-full justify-start h-auto p-1 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-full shadow-sm">
              {tabItems.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-2 px-6 py-3 rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="overview" className="mt-0 space-y-4">
              <DashboardWidgets />
            </TabsContent>

            <TabsContent value="social-groups" className="mt-0">
              <SocialGroupsNav />
            </TabsContent>

            <TabsContent value="activities" className="mt-0">
              <ActivityTimeline />
            </TabsContent>

            <TabsContent value="letters" className="mt-0">
              <LetterHistory />
            </TabsContent>

            <TabsContent value="management" className="mt-0">
              <div className="space-y-8">
                <ActivityManager />
                <GroupManager />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Profil Ayarları</CardTitle>
                  <CardDescription>
                    Profil bilgilerinizi güncelleyin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-10 h-10 opacity-50" />
                    </div>
                    <p className="text-lg font-medium">Ayarlar paneli hazırlanıyor...</p>
                    <p className="text-sm">Yakında burada profilinizi düzenleyebileceksiniz.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  )
}