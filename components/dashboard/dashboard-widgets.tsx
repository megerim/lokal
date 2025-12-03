"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { ensureUserProfile } from "@/lib/supabase/ensure-profile"
import { useAuth } from "@/components/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { errorHandler } from "@/lib/error-handler"
import Link from "next/link"
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Gift,
  Activity,
  Star,
  ArrowRight,
  MapPin,
  MessageCircle,
  Coffee,
  Target,
  Trophy,
  Sparkles
} from "lucide-react"
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns"
import { tr } from "date-fns/locale"
import type { Activity as ActivityType, SocialGroup, PersonalLetter, UserProfile } from "@/lib/types"
import { CoffeeVoucherDisplay } from "@/components/coffee-voucher-display"
import { MarketApplicationStatus } from "@/components/dashboard/market-application-status"
import { motion } from "framer-motion"

interface DashboardData {
  upcomingActivities: ActivityType[]
  recentGroupActivity: Array<{
    group_name: string
    group_id: string
    last_comment: string
    comment_user: string
    comment_time: string
  }>
  recentLetters: PersonalLetter[]
  profile?: UserProfile
  birthdayReminder?: boolean
}

export function DashboardWidgets() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData>({
    upcomingActivities: [],
    recentGroupActivity: [],
    recentLetters: []
  })
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      // Fetch upcoming activities user is registered for
      const { data: attendanceData } = await supabase
        .from("activity_attendance")
        .select("activity_id")
        .eq("user_id", user.id)

      let upcomingActivities: ActivityType[] = []
      if (attendanceData && attendanceData.length > 0) {
        const activityIds = attendanceData.map(a => a.activity_id)
        const { data: activitiesData } = await supabase
          .from("activities")
          .select("*")
          .in("id", activityIds)
          .eq("status", "upcoming")
          .gte("date_time", new Date().toISOString())
          .order("date_time", { ascending: true })
          .limit(3)

        upcomingActivities = (activitiesData || []) as ActivityType[]
      }

      // Fetch recent group activity
      const { data: userGroups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)

      const groupIds = userGroups?.map(ug => ug.group_id) || []

      let recentGroupActivity: Array<{
        group_name: string
        group_id: string
        last_comment: string
        comment_user: string
        comment_time: string
      }> = []
      if (groupIds.length > 0) {
        const { data: recentComments } = await supabase
          .from("club_comments")
          .select(`
            id,
            content,
            user_name,
            created_at,
            group_id,
            social_groups!inner (name)
          `)
          .in("group_id", groupIds)
          .neq("user_id", user.id) // Exclude user's own comments
          .order("created_at", { ascending: false })
          .limit(5)

        recentGroupActivity = recentComments?.map(comment => ({
          group_name: (comment.social_groups as any)?.name || "Bilinmeyen Grup",
          group_id: comment.group_id,
          last_comment: comment.content,
          comment_user: comment.user_name,
          comment_time: comment.created_at
        })) || []
      }

      // Fetch recent personal letters
      const { data: recentLetters } = await supabase
        .from("personal_letters")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(3)

      // Check for birthday reminder (within 7 days)
      const birthdayReminder = profileData?.birthday ? (() => {
        const today = new Date()
        const birthday = new Date(today.getFullYear(),
          new Date(profileData.birthday).getMonth(),
          new Date(profileData.birthday).getDate()
        )
        const daysUntilBirthday = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilBirthday >= 0 && daysUntilBirthday <= 7
      })() : false

      setData({
        upcomingActivities,
        recentGroupActivity,
        recentLetters: recentLetters || [],
        profile: profileData,
        birthdayReminder
      })

    } catch (error: any) {
      errorHandler.logError('Error fetching dashboard data', error)
      console.error("Dashboard widgets error details:", error?.message, error?.details)
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

  const formatActivityTime = (dateTime: string) => {
    const date = new Date(dateTime)
    if (isToday(date)) {
      return `Bugün ${format(date, "HH:mm")}`
    } else if (isTomorrow(date)) {
      return `Yarın ${format(date, "HH:mm")}`
    } else {
      return format(date, "d MMM HH:mm", { locale: tr })
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse border-none shadow-sm rounded-2xl">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Birthday Reminder */}
      {data.birthdayReminder && (
        <motion.div variants={item}>
          <Card className="border-none bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-sm rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl">
                  <Gift className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                    Doğum gününüz yaklaşıyor! 🎉
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Özel doğum günü kuponunuzu almayı unutmayın
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Activities */}
        <motion.div variants={item}>
          <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white dark:bg-gray-900 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6" />
                </div>
                Yaklaşan Aktiviteler
              </CardTitle>
              <CardDescription className="text-base">
                Kayıt olduğunuz gelecek etkinlikler
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.upcomingActivities.length > 0 ? (
                <div className="space-y-4">
                  {data.upcomingActivities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-gray-800 shadow-sm text-center overflow-hidden">
                        <span className="text-xs font-bold text-red-500 uppercase">
                          {format(new Date(activity.date_time), 'MMM', { locale: tr })}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {format(new Date(activity.date_time), 'd')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{activity.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{format(new Date(activity.date_time), "HH:mm")}</span>
                          </div>
                          {activity.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[100px]">{activity.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full justify-between hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 group/btn" asChild>
                    <Link href="/dashboard?tab=activities">
                      Tüm Aktiviteler
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700">
                  <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Yaklaşan aktivite yok</p>
                  <p className="text-sm text-muted-foreground mb-4">Yeni deneyimler keşfetmeye ne dersin?</p>
                  <Button className="rounded-full" asChild>
                    <Link href="/duyurular">Aktiviteleri Keşfet</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Group Activity */}
        <motion.div variants={item}>
          <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white dark:bg-gray-900 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6" />
                </div>
                Grup Aktiviteleri
              </CardTitle>
              <CardDescription className="text-base">
                Gruplarınızdan son aktiviteler
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentGroupActivity.length > 0 ? (
                <div className="space-y-4">
                  {data.recentGroupActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border border-transparent hover:border-green-100 dark:hover:border-green-800">
                      <div className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm shrink-0">
                        <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 text-sm">{activity.group_name}</h4>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-sm">
                            {formatDistanceToNow(new Date(activity.comment_time), {
                              addSuffix: true,
                              locale: tr
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{activity.comment_user}:</span> {activity.last_comment}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full justify-between hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 group/btn" asChild>
                    <Link href="/dashboard?tab=social-groups">
                      Tüm Gruplar
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700">
                  <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Grup aktivitesi yok</p>
                  <p className="text-sm text-muted-foreground mb-4">İlgi alanlarına uygun gruplara katıl</p>
                  <Button className="rounded-full" variant="outline" asChild>
                    <Link href="/sosyal-gruplar">Gruplara Katıl</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Personal Letters */}
        <motion.div variants={item}>
          <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white dark:bg-gray-900 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                Son Mektuplarım
              </CardTitle>
              <CardDescription className="text-base">
                Yakın zamanda yazdığınız mektuplar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentLetters.length > 0 ? (
                <div className="space-y-4">
                  {data.recentLetters.map(letter => (
                    <div key={letter.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-transparent hover:border-purple-100 dark:hover:border-purple-800">
                      <div className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm shrink-0">
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{letter.title}</h4>
                          <Badge variant={letter.status === 'published' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0 h-5">
                            {letter.status === 'published' ? 'Yayınlandı' : 'Taslak'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {letter.content.substring(0, 80)}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(letter.updated_at), {
                            addSuffix: true,
                            locale: tr
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full justify-between hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 group/btn" asChild>
                    <Link href="/dashboard?tab=letters">
                      Tüm Mektuplar
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700">
                  <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Henüz mektup yazmadınız</p>
                  <p className="text-sm text-muted-foreground mb-4">Düşüncelerinizi kaydetmeye başlayın</p>
                  <Button className="rounded-full" variant="outline" asChild>
                    <Link href="/dashboard?tab=letters">İlk Mektubunuzu Yazın</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Kahve Kuponlarım + Sadakat Programı (Merged) */}
        <motion.div variants={item}>
          <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white dark:bg-gray-900 group overflow-hidden">
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                  <Coffee className="w-6 h-6" />
                </div>
                Kahve & Sadakat
              </CardTitle>
              <CardDescription className="text-base">
                Aktif kuponlarınız ve sadakat ilerlemeniz
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {/* Compact variant merges vouchers + loyalty into single card content */}
              <CoffeeVoucherDisplay variant="compact" />
            </CardContent>
            {/* Decorative background element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-50 dark:bg-orange-900/10 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150" />
          </Card>
        </motion.div>

        {/* Yılbaşı Pazarı Başvuru Durumu */}
        <motion.div variants={item}>
          <MarketApplicationStatus />
        </motion.div>
      </div>
    </motion.div>
  )
}